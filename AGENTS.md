## PsicoGestão NR-1 — Estado e Decisões de Arquitetura

- **Stack**: TanStack Start (React 19, TypeScript), Vite 8, Tailwind CSS v4, Vitest, Playwright.
- **Domínio isolado**: Modelos, cálculos determinísticos e regras puras em `src/domain` (`calc.ts`, `privacy.ts`, `actions.ts`, `instruments.ts`, `suggestions.ts`), independentes de componentes visuais.
- **Persistência desacoplada**: `DatabaseRepository` em `src/data/repository.ts` abstrai o `localStorage`, pronto para substituição por API backend com banco de dados.
- **Privacidade por design**: Supressão automática para grupos menores que o limiar configurado (k-anonimato) e supressão complementar no cálculo por escopo (`src/features/shared.ts`). Nenhuma tela administrativa expõe dados individuais.
- **Fluxo de Sugestões e Ações**: Sugestões geradas são propostas pendentes; aprovação humana obrigatória em `src/domain/actions.ts` preservando proposta original e exigindo responsável, prazo e métricas de eficácia.
- **Testes**: Suíte unitária cobrindo 100% das regras críticas de cálculo/privacidade/ações e suíte E2E cobrindo o fluxo de ponta a ponta.
- **Handoff detalhado**: Consulte [docs/HANDOFF.md](docs/HANDOFF.md) para especificações completas de regras, arquitetura e roadmap de continuidade.
