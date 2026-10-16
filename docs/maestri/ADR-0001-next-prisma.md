# ADR-0001 — Stack do backend: Next.js + Prisma

- **Data:** 15/10/2026 · **Decidido por:** Rodrigo (Product Owner)
- **Status:** aceito; executa na E3.

## Contexto
O protótipo é TanStack Start + React com persistência em `localStorage` (`src/data/repository.ts`). A E3 exige banco real com isolamento por empresa; a E4 exige coleta anônima no servidor.

## Decisão
Migrar para **Next.js + Prisma** (padrão dos demais projetos), mantendo o domínio puro de `src/domain/` intacto e a interface do `DatabaseRepository` como contrato.

## Consequências
- `src/domain/` e seus testes são portados sem alteração; a migração é de rotas/UI/persistência.
- O schema Prisma deve respeitar os invariantes do HANDOFF (anonimato, agregação, supressão, congelamento do instrumento) e a skill `invariantes-nr1`.
- E2 (Playwright) vira a rede de segurança da migração: o e2e precisa passar igual antes e depois.
- E3-T01 deixa de ser "decidir" e passa a ser "plano de migração + scaffolding Next.js".
- Tarefa extra E3-T05: remover o acoplamento ao Lovable (`@lovable.dev/*`, registro `europe-west1-npm.pkg.dev`, `lovable-error-reporting`).

## Riscos
- O repo é sincronizado com o Lovable; a migração deve acontecer em branch `etapa/E3-*` e só entrar na `main` com e2e verde. Confirmar com o Rodrigo se a sincronização com o Lovable será encerrada na E3.
