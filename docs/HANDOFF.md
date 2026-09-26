# Handoff — PsicoGestão NR-1

## Estado da entrega

Protótipo demonstrativo com persistência local, uma empresa fictícia, quatro setores, uma campanha em análise com respostas fictícias, uma campanha em rascunho, três riscos e duas ações. A campanha principal pode ser usada para explorar resultados, riscos, ações e relatório; abra a campanha em rascunho para exercitar a coleta. Não foi criado backend, serviço pago ou coleta real.

## Arquitetura

- `src/routes/`: páginas TanStack Start; `responder.$campaignId.tsx` é a rota de resposta separada da navegação administrativa.
- `src/features/`: interface (`layout`, `dashboard`, `pages`, `respond`) e adaptação dos resultados agregados (`shared`).
- `src/domain/types.ts`: entidades e estados de domínio; `instruments.ts`: catálogo e fontes; `demo-data.ts`: dados fictícios reproduzíveis; `calc.ts`: cálculo puro; `privacy.ts`: agregação e supressão; `suggestions.ts`: contrato do provedor e implementação simulada.
- `src/data/repository.ts`: fronteira de persistência substituível. `src/state/store.tsx`: estado React e sincronização local.
- `src/styles.css`: sistema de cores, tipografia e estilos, incluindo impressão A4.

Entidades: `Company`, `Department`, `Campaign`, `InstrumentVersion`, `DimensionDefinition`, `QuestionDefinition`, `AnonymousResponse`, `CalculationResult`, `RiskAssessment`, `ActionSuggestion`, `ActionPlanItem`, `ReportSnapshot`, `MethodologySource`.

## Regras e limites técnicos

- Instrumento demonstrativo v1: 15 perguntas fictícias em cinco dimensões, alternativas 0–4, normalização 0–100. Itens invertidos espelham a pontuação. A média da dimensão calcula-se por participante válido e depois entre participantes válidos. O mínimo de itens válidos por participante é 2 dos 3, e a dimensão exige ao menos 3 participantes válidos. Ausência nunca vira zero.
- Versões curta, média e longa do COPSOQ são independentes e **pendentes de validação documental**. Nenhum item oficial foi copiado e não se assumiu edição, adaptação ou quantidade de perguntas.
- Resultados sem referência interpretativa são descritivos. Não há cortes, score global ou conversão de pontuação em probabilidade/severidade. Riscos requerem julgamento e justificativa humana.
- Privacidade: mínimo configurável, inicialmente 5, com supressão de grupos abaixo do mínimo e de mais um grupo quando só um foi suprimido. Gráficos, tabela, relatório e contexto do provedor recebem apenas resultados liberados. Respostas individuais permanecem no armazenamento local para o cálculo, mas não têm tela administrativa. **Revisar novamente contra ataques de diferenciação quando novos filtros ou exportações forem criados.**
- Campanhas abertas guardam `instrumentSnapshot` e `frozenAt`. Alterações futuras no catálogo não recalculam versões antigas.
- Sugestões são propostas; nunca aprovadas automaticamente. Riscos não avaliados recebem propostas exploratórias sem botão de aprovação habilitado. Aprovação exige responsável, prazo estimado e indicador de execução; ação guarda proposta original e versão aprovada. Implementação e verificação de eficácia têm estados e datas separados.
- Relatórios geram um retrato imutável dos dados selecionados naquele momento dentro do armazenamento local; a impressão do retrato não altera registros posteriores.

## Fontes e verificação

Links iniciais cadastrados: [NR-1 / MTE](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-1), [COPSOQ International Network](https://www.copsoq-network.org/), [licença e questionário](https://www.copsoq-network.org/licence-guidelines-and-questionnaire), [estudos de validação](https://www.copsoq-network.org/validation-studies). **Nenhum documento foi verificado nesta etapa.** Nenhuma seção, ponto de corte, validade científica ou obrigação normativa foi inventada.

## Próximas etapas para Antigravity/Codex

1. Obter instrumento e manuais/licenças oficiais, verificar edição/adaptação brasileira, regras, referências e condições de uso com especialista; versionar cada adaptação separadamente.
2. Projetar servidor e banco com controles de acesso, logs adequados, convites sem identificação e política de retenção antes de coletar dados reais. Redesenhar prevenção de duplicidade sem rastreamento pessoal; revisar modelo de ameaça para anonimato, grupos, exportações e consultas cruzadas.
3. Substituir `DatabaseRepository` por API com controle de concorrência, histórico/auditoria e autorização. Não migrar respostas locais fictícias como se fossem reais.
4. Implementar provedor real de IA somente em serviço seguro; não enviar dados individuais, validar saída e exigir aprovação humana.
5. Formalizar critérios de avaliação ocupacional com profissionais responsáveis, critérios de classificação e fluxo de aprovação; validar relatório e documentos normativos.
6. Ampliar testes automatizados de domínio e fluxos ponta a ponta; testar acessibilidade e impressão em diferentes navegadores.
