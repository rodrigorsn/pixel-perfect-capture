# STATUS (manual — vira gerado quando a E0-T00 entrar)

Atualizado: 21/10/2026 · Branch: `maestri/e0-docs` (PR de docs da E0) · Etapa: **E0 — Fundação (em fechamento)**

A E1 não começa sem a E0 aprovada (PAPEIS). O log ao vivo `.maestri/eventos.jsonl` da sessão anterior do Maestro se perdeu; este STATUS é mantido a partir do GitHub.

## Estado da `main`

`4a0811e`. Entraram os PRs #1 a #17. Os merges de #4, #7 a #17 foram feitos pelo Maestro por delegação explícita do Rodrigo (20 e 21/10). A `main` tem `test:unit`, `typecheck`, `lint`, `test:e2e` e `build`, sem vínculo com o Lovable, **CI verde** (GitHub Actions, primeiro run na `main`: 39697634313) e `.gitattributes` com LF. Ainda não tem os scripts `task` e `status`.

## E0 — tarefas

| Tarefa | Estado | Onde |
|---|---|---|
| E0-T00 painel `bun run task` / `bun run painel` | a fazer | — |
| E0-T01 instalação reproduzível fora do Lovable | **concluída** (junto com a E0-T07) | PR #4 |
| E0-T02 typecheck limpo | concluída; confirmar no CI | `main` (#3) |
| E0-T03 scripts `test` e `typecheck` na `main` | **concluída** | PR #3 |
| E0-T04 CI GitHub Actions: test + typecheck + build | **concluída**; CI verde na `main` | PR #16 |
| E0-T05 teste Kimi K2.7 Code × DeepSeek V4.1 Flash | a fazer; Dev provisório: Kimi | — |
| E0-T06 destino do trabalho local não commitado | **concluída** (preservado e mergeado como E0-T03) | PR #3 |
| E0-T07 desvincular do Lovable | **concluída**; pareceres em VALIDACOES | PR #4 |
| E0-T08 `.gitattributes` LF + renormalização | **concluída** | PR #17 |
| E0-T09 `overrides` de `h3`/`rou3`/`srvx`/`@radix-ui` + `packageManager` | **próxima** (Dev) | — |

**Pronto da E0 (CRONOGRAMA):** CI verde na `main` ✅ e o vencedor da E0-T05 registrado em VALIDACOES. Faltam E0-T09, E0-T05 e E0-T00; depois, o PR "E0 — fechamento".

## Próximas tarefas, nesta ordem

1. E0-T09: fixar `h3`, `rou3`, `srvx` e `@radix-ui/*` via `overrides` e `packageManager: "bun@1.3.14"`. Fluxo completo.
2. E0-T05: teste de modelos na mesma tarefa; Revisor compara e o vencedor vai para o VALIDACOES.
3. E0-T00: painel `bun run task` / `bun run status` (deixa este arquivo gerado).
4. PR "E0 — fechamento" e tag `etapa-E0`.
5. E1, nesta ordem: E1-T00a, E1-T00e (setor órfão), E1-T00b–d, E1-T01 a E1-T05, E1-T08 e E1-T09.

## Trilha paralela

- P-T01 instrumento validado (COPSOQ): **bloqueada**, aguardando licença e manual.
- P-T02 referências documentais: **concluída** (#7); ver `docs/referencias/LACUNAS.md`.

## Ambiente

- Agentes (Dev, Revisor, Segunda opinião, QA) conectados ao Maestro no canvas do Maestri em 20/10.
- Worktrees: `-dev` na branch da tarefa em andamento. `-revisor`, `-segunda` e `-qa` em HEAD destacado; o Maestro os posiciona a cada tarefa.
- Worktrees extras, limpos e não previstos no PAPEIS: `.kilo/worktrees/pushy-radar` (`a3465e8`) e dois na pasta temporária da sessão anterior do Maestro (`wt-docs`, `wt-e0`). Remover só com ok do Rodrigo.
- `gh` instalado e autenticado: o Maestro publica pareceres com `gh pr comment`.
- A conferir: com o #12, o QA perdeu `git switch` no bloco dele, mas o bloco global do `opencode.json` ainda permite; testar se o QA é de fato bloqueado.

## Decisões registradas

- (15/10) E3: **Next.js + Prisma** — ver [ADR-0001](ADR-0001-next-prisma.md).
- (15/10) Datas mantidas; trabalho local preservado em `etapa/E0-T03-baseline-local`, revisado e mergeado (#3).
- (16/10) Provedor `opencode-go` para todos os agentes (Dev kimi-k2.7-code, Revisor deepseek-v4-pro, Segunda opinião glm-5.2, QA deepseek-v4.1-flash). Ver PAPEIS.md.
- (16/10) Teste de permissões aprovado (#9).
- (20/10) Deriva de versões do `bun.lock` (#4) aceita; fixar via `overrides` em tarefa separada.
- (20/10) Merges de #4 e #7 a #12 delegados ao Maestro pelo Rodrigo.
- (20/10) Bash fora da lista negado aos agentes; trilha leve Maestro → Revisor → Rodrigo para docs, config e CI; um PR de docs por etapa (#15).
- (21/10) Merges de #13 a #17 delegados ao Maestro pelo Rodrigo. CI: não cancela runs na `main` e timeout de 15 min (#16).
- (21/10) E0-T08: três arquivos `.ts` estavam commitados com CRLF e um CR solto no final, o que fazia o git tratá-los como binários; convertidos para LF sem mudança de conteúdo (#17).

## A acompanhar

- As actions do CI rodam em Node 20, que o GitHub está descontinuando; atualizar o SHA de `actions/checkout` e `oven-sh/setup-bun` quando houver versão em Node 24.

## Pendências do Rodrigo

- Licença e manual COPSOQ (P-T01).
