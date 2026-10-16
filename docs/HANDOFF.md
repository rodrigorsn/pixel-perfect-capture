# Handoff — PsicoGestão NR-1

## 1. Estado da Entrega e Visão Geral

Protótipo demonstrativo com arquitetura desacoplada, persistência local em `localStorage`, empresa fictícia, quatro setores configurados, campanha principal em análise com respostas fictícias, campanha em rascunho para simulação de coleta, matriz de riscos ocupacionais, sugestões estruturadas e plano de ação.

- **Stack Técnica**: TanStack Start (React 19, TypeScript), Vite 8, Tailwind CSS v4, Lucide Icons, Recharts, Radix UI.
- **Armazenamento**: Local via camada de abstração `src/data/repository.ts` (`DatabaseRepository`), isolada dos componentes React.
- **Validação de Qualidade**: 29 testes unitários/integração (Vitest) e 3 cenários E2E (Playwright).

---

## 2. Arquitetura e Estrutura de Código

- `src/domain/`: Regras de negócio puras, determinísticas e sem dependência de UI ou framework:
  - `types.ts`: Tipagem completa do sistema (`Company`, `Department`, `Campaign`, `InstrumentVersion`, `AnonymousResponse`, `CalculationResult`, `RiskAssessment`, `ActionSuggestion`, `ActionPlanItem`, `ReportSnapshot`).
  - `calc.ts`: Cálculo de médias, normalização (0–100), tratamento de itens invertidos e pontuação por dimensão exigindo participantes válidos (mínimo de respostas válidas por participante e mínimo de participantes por dimensão).
  - `privacy.ts`: Regras de k-anonimato com supressão de grupos abaixo do limiar (default: 5) e supressão complementar para evitar deduções em comparações de setores.
  - `instruments.ts`: Catálogo de versões do instrumento (versão demonstrativa liberada; versões COPSOQ curta/média/longa mantidas com status `pendente_validacao_documental`).
  - `actions.ts`: Validação de planos de ação (5W2H simplificado) e aprovação idempotente de sugestões com preservação da proposta original.
  - `suggestions.ts`: Contrato de provedor (`SuggestionProvider`) e provedor simulado local (`demoSuggestionProvider`) sem vazamento de dados individuais.
  - `demo-data.ts`: Gerador de sementes e dados fictícios reproduzíveis.
- `src/data/`:
  - `repository.ts`: Interface e implementação do repositório (`DatabaseRepository`) com isolamento de `localStorage`, tratamento de dados corrompidos e reset para base demonstrativa.
- `src/features/`: Componentes visuais organizados por módulos (`dashboard`, `pages`, `respond`, `shared`, `layout`).
  - `pages.tsx`: Visões de Campanhas, Resultados, Riscos, Ações, Relatórios e Metodologia/Configurações.
  - `respond.tsx`: Interface focada no participante para resposta anônima do questionário.
  - `shared.ts`: Agregação e cálculo de resultados por escopo com proteção de privacidade.
- `src/routes/`: Rotas TanStack Start baseadas em arquivo.
  - `responder.$campaignId.tsx`: Rota isolada para resposta pública/anônima do colaborador.
- `src/state/`:
  - `store.tsx`: Contexto e provedor React para distribuição de estado e sincronização com o repositório.
- `tests/`:
  - `tests/e2e/critical-flow.spec.ts`: Fluxo crítico completo dos sete passos (campanha, coleta, cálculo, risco, sugestão, ação e relatório).
  - `tests/e2e/invariants.spec.ts`: Invariantes de bloqueio de versões pendentes e aprovação idempotente sem duplicidade.

---

## 3. Regras de Negócio e Limites Técnicos

1. **Instrumento Demonstrativo v1**:
   - 15 perguntas distribuídas em 5 dimensões (Exigências Quantitativas, Ritmo de Trabalho, Apoio Social, Clareza de Papel, Reconhecimento).
   - Alternativas de 0 a 4 normalizadas em escala 0–100. Itens invertidos têm pontuação espelhada.
   - Cada participante precisa de ao menos 2 itens válidos em 3 da dimensão para ser considerado válido nela. Uma dimensão exige ao menos 3 participantes válidos.
2. **COPSOQ e Instrumentos Oficiais**:
   - As versões COPSOQ no catálogo estão bloqueadas para publicação e abertura (`pendente_validacao_documental`). Nenhum item oficial com direitos autorais foi copiado.
3. **Privacidade e Supressão**:
   - Limiar configurável (padrão de 5 respostas). Grupos com menos de 5 respostas são suprimidos.
   - Aplica-se supressão complementar se apenas um setor for suprimido (evita descoberta por subtração do total da empresa).
   - Nenhum dado individual de resposta é exibido em telas administrativas ou enviado a provedores externos.
4. **Avaliação de Riscos e Sugestões**:
   - A pontuação psicossocial não se converte automaticamente em nível de risco. A classificação do risco (baixo, moderado, alto, muito alto) requer julgamento humano fundamentado.
   - Sugestões geradas pela IA simulada permanecem em status `pendente` e exigem aprovação explícita.
   - Aprovação de sugestão requer definição de responsável, prazo válido, indicador de execução, indicador de eficácia e método de verificação. A versão original é preservada em `originalProposal`.
5. **Relatório**:
   - Ao salvar um relatório, é gerado um `ReportSnapshot` imutável no banco local, garantindo integridade documental para impressão/PDF.

---

## 4. Próximos Passos para Continuidade (Handoff)

1. **Validação Jurídico-Científica dos Instrumentos**:
   - Obter licenças e manuais oficiais dos instrumentos psicossociais validados para o Brasil (ex: COPSOQ III / adaptações validadas).
   - Parametrizar pontos de corte e referências científicas validadas antes de liberar novas versões.
2. **Backend e Segurança**:
   - Substituir `DatabaseRepository` por API REST/GraphQL conectada a banco relacional (ex: PostgreSQL/Prisma).
   - Implementar autenticação corporativa (SSO/JWT), controle de acesso baseado em papéis (RBAC) e logs de auditoria.
   - Implementar tokens de resposta efêmeros ou links públicos para garantir unicidade sem identificação nominal do trabalhador.
3. **Provedor Real de IA (LLMs)**:
   - Implementar o contrato `SuggestionProvider` em serviço backend seguro.
   - Enviar apenas metadados agregados e descrições de riscos avaliados (nunca dados brutos de respostas).
4. **Relatórios e Acessibilidade**:
   - Suporte a download direto em PDF gerado no servidor.
   - Auditoria de acessibilidade WCAG 2.1 AA em todo o fluxo de resposta e painel administrativo.

---

## 5. Comandos de Verificação e Execução

- `bun install`: Instalação de dependências.
- `bun run dev`: Inicia o servidor Vite na porta configurada (default: 8080).
- `bun run test:unit`: Executa suite de testes unitários e de integração com Vitest.
- `bun run test:e2e`: Executa testes de ponta a ponta com Playwright.
- `bun run typecheck`: Checagem estática de tipos TypeScript (`tsc --noEmit`).
- `bun run lint`: Análise de código com ESLint.
- `bun run build`: Compilação de produção.