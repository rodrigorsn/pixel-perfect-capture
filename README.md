# PsicoGestão NR-1

Protótipo interno em português brasileiro para demonstrar avaliação e gestão de fatores de risco psicossociais em **uma empresa fictícia**. Não é instrumento validado, não substitui o PGR completo e não atesta conformidade com a NR-1.

## Executar

```bash
bun install
bun run dev
```

Abra `http://localhost:8080`. Requer Node/Bun compatível com o projeto TanStack Start. O comando de build é `bun run build`.

## O que funciona

- Edição da empresa e setores; campanhas com criação, edição de rascunhos, abertura, encerramento, análise e finalização.
- A abertura congela uma cópia da versão do instrumento e das regras. Versões COPSOQ pendentes não podem ser escolhidas para abertura.
- Questionário móvel separado em `/responder/:campaignId`, com perguntas fictícias, revisão e envio local. Para abrir uma campanha e responder, use um novo rascunho ou a campanha de reavaliação existente; a campanha principal foi pré-carregada em análise.
- Geração de respostas fictícias para campanha aberta, cálculo determinístico de dimensões, supressão de grupos pequenos e supressão complementar.
- Cadastro e avaliação manual de riscos, geração local de sugestões estruturadas, edição, rejeição motivada, aprovação humana e acompanhamento de ações.
- Relatório imprimível em A4, opção “Salvar em PDF” pelo navegador e versões de retrato salvas localmente.
- “Restaurar demonstração” em Metodologia e configurações.

## Simulações e limites

**Todos os dados são fictícios.** A empresa, os setores, as respostas, os riscos e as ações iniciais são exemplos. O questionário é próprio e ilustrativo — **não é COPSOQ**. As três versões COPSOQ do catálogo são apenas registros documentais, bloqueados para publicação; seus manuais e termos de uso não foram fornecidos ou verificados. Pontuações não viram classificação de risco automaticamente. Não há pontos de corte validados, diagnóstico clínico ou nota de conformidade.

Persistência é `localStorage`, isolada em `src/data/repository.ts`, para facilitar troca por API. Um link de resposta em outro dispositivo não compartilha dados. Não há autenticação, centralização, garantia real de anonimato ou unicidade, envio de mensagens, eSocial, multitenancy nem provedor real de IA. Não use para dados reais de trabalhadores. A política inicial de 5 respostas é **ilustrativa**, não requisito numérico da NR-1. A supressão complementar ajuda contra dedução simples, mas não substitui revisão de privacidade de futuras segmentações/exportações.

## Provedor de sugestões

`src/domain/suggestions.ts` declara `SuggestionProvider` e `SuggestionContext`. `demoSuggestionProvider` seleciona modelos locais coerentes com o risco; não faz chamadas de IA. Para trocar, implemente a interface em um serviço seguro do lado do servidor; valide a entrada, envie apenas resultados agregados liberados, mantenha revisão humana e nunca envie respostas individuais. A interface atual chama o provedor local em `src/features/pages.tsx`.

Veja [docs/HANDOFF.md](docs/HANDOFF.md) para arquitetura, regras, limites e próximos passos.
