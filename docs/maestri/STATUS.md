# STATUS (manual — vira gerado quando a E0-T00 entrar)

Atualizado: 19/10/2026 · Branch: `maestri/status-e1` · Etapa: **E0 — Fundação (em fechamento)**

A E1 estava prevista para começar hoje (19–23/out), mas não começa sem a E0 aprovada (PAPEIS). O log ao vivo `.maestri/eventos.jsonl` da sessão anterior do Maestro se perdeu; este STATUS foi reconstruído a partir do GitHub.

## Estado da `main`

`d480de2`. Entraram os PRs #1 (estrutura), #2 (ajustes da especificação), #5 (worktrees por papel), #6 (OpenCode Go e leitura do git) e #3 (E0-T03 baseline). A `main` tem `test:unit`, `typecheck`, `lint`, `test:e2e` e `build`; ainda não tem CI (`.github/`), nem os scripts `task` e `status`.

## E0 — tarefas

| Tarefa | Estado | Onde |
|---|---|---|
| E0-T00 painel `bun run task` / `bun run painel` | a fazer | — |
| E0-T01 instalação reproduzível fora do Lovable | em revisão (junto com a E0-T07) | PR #4 |
| E0-T02 typecheck limpo | concluída; confirmar no CI | `main` (#3) |
| E0-T03 scripts `test` e `typecheck` na `main` | **concluída** | PR #3 |
| E0-T04 CI GitHub Actions: test + typecheck + build | a fazer | — |
| E0-T05 teste Kimi K2.7 Code × DeepSeek V4.1 Flash | a fazer; Dev provisório: Kimi | — |
| E0-T06 destino do trabalho local não commitado | **concluída** (preservado e mergeado como E0-T03) | PR #3 |
| E0-T07 desvincular do Lovable | em revisão, aguardando merge | PR #4 |

**Pronto da E0 (CRONOGRAMA):** CI verde na `main` e o vencedor da E0-T05 registrado em VALIDACOES. Faltam E0-T04 e E0-T05; depois, o PR "E0 — fechamento".

## PRs abertos

| PR | Branch | Conteúdo | Observação |
|---|---|---|---|
| #4 | `etapa/E0-T07-desvincular-lovable` | E0-T07 (+ E0-T01) | Base trocada de `etapa/E0-T03-baseline-local` para `main` (19/10); diff só com os 8 arquivos da E0-T07. Revisor, Segunda opinião e QA aprovaram em `ae88ff8` (unit 31/31, typecheck, build, e2e 3/3); pareceres publicados no PR. |
| #7 | `etapa/P-T02-referencias` | P-T02: referências documentais e LACUNAS | Só docs. P-T02 não está no CRONOGRAMA; registrar na trilha P. |
| #8 | `maestri/licao-diff-normalizado` | Lições do PR #3; E1-T00a–d | Só docs. |
| #9 | `maestri/validacao-permissoes` | Teste de permissões dos agentes | Só docs. Rodrigo aprovou em 16/10 por mensagem. |
| este | `maestri/status-e1` | STATUS e prompt de abertura do Maestro | Só docs. |

## Próximas tarefas, nesta ordem

1. Rodrigo: decidir a deriva de versões do `bun.lock` no #4 (aceitar ou fixar `h3`/`rou3`/`srvx` via `overrides`), desconectar o Lovable e decidir o merge de #4, #7, #8, #9 e #10.
2. E0-T04: CI no GitHub Actions (test:unit + typecheck + build), depois do #4 para o CI já rodar sem o registro do Lovable.
3. E0-T05: teste de modelos na mesma tarefa; Revisor compara e o vencedor vai para o VALIDACOES.
4. E0-T00: painel `bun run task` / `bun run status` (deixa este arquivo gerado).
5. PR "E0 — fechamento" e tag `etapa-E0`.
6. E1, começando por E1-T00a–d (#8) e depois E1-T01 a E1-T05.

## Trilha paralela

- P-T01 instrumento validado (COPSOQ): **bloqueada**, aguardando licença e manual.
- P-T02 referências documentais: em revisão (#7).

## Ambiente

- Worktrees: `-dev` na branch `etapa/E0-T03-baseline-local` (já mergeada; reposicionar na próxima tarefa). `-revisor`, `-segunda` e `-qa` em HEAD destacado em `ae88ff8` (ponta da E0-T07). Todos limpos.
- Worktrees extras, limpos e não previstos no PAPEIS: `.kilo/worktrees/pushy-radar` (`a3465e8`) e dois na pasta temporária da sessão anterior do Maestro (`wt-docs`, `wt-e0`). Remover só com ok do Rodrigo.
- `gh` instalado e autenticado (19/10): o Maestro publica pareceres com `gh pr comment`.

## Decisões registradas

- (15/10) E3: **Next.js + Prisma** — ver [ADR-0001](ADR-0001-next-prisma.md).
- (15/10) Datas mantidas; trabalho local preservado em `etapa/E0-T03-baseline-local`, revisado e mergeado (#3).
- (16/10) Provedor `opencode-go` para todos os agentes (Dev kimi-k2.7-code, Revisor deepseek-v4-pro, Segunda opinião glm-5.2, QA deepseek-v4.1-flash). Ver PAPEIS.md.
- (16/10) Teste de permissões aprovado (#9).

## Pendências do Rodrigo

- Desconectar o projeto no painel do Lovable e revogar o GitHub App (fecha a E0-T07).
- Licença e manual COPSOQ (P-T01).
