# STATUS

Atualizado: 24/10/2026 · Etapa: **E0 — Fundação (aguardando o ok do Rodrigo para fechar)** · `main` `2d63db5`

O quadro de tarefas no fim deste arquivo é **gerado** por `bun run status` (a partir de `docs/maestri/plano.json`); mudanças de estado passam por `bun run task`. O texto acima do quadro é escrito à mão.

## Estado da `main`

`2d63db5`, CI verde. Entraram os PRs #1 a #17 e #19 a #21; o #18 (docs da E0) é o PR de fechamento da etapa. A `main` tem `test:unit`, `typecheck`, `lint`, `test:e2e`, `build`, CI no GitHub Actions, `.gitattributes` com LF, `@radix-ui/*` fixados via `overrides`, `packageManager` e o painel (`task`, `painel`, `status`).

## Fechamento da E0

**Pronto (CRONOGRAMA):** CI verde na `main` ✅ · vencedor da E0-T05 registrado no VALIDACOES ✅. E0-T00 e E0-T05 estão em `aguardando_rodrigo`; com o ok do Rodrigo, o Maestro as marca `concluida`, salva o log em `historico/E0-eventos.jsonl`, faz o merge deste PR e cria a tag `etapa-E0`.

## Próximas tarefas (E1, nesta ordem)

E1-T00a, E1-T00e (setor órfão), E1-T00b–d, E1-T01 a E1-T05, E1-T08 e E1-T09.

## Trilha paralela

- P-T01 instrumento validado (COPSOQ): **bloqueada**, aguardando licença e manual.
- P-T02 referências documentais: **concluída** (#7); ver `docs/referencias/LACUNAS.md`.

## Ambiente

- Agentes no canvas do Maestri: Dev (DeepSeek V4.1 Flash), Revisor (Kimi K2.7 Code), Segunda opinião (GLM-5.2), QA (DeepSeek V4.1 Flash). Reiniciados com os modelos novos em 24/10.
- Worktrees: `-dev` na branch da tarefa em andamento. `-revisor`, `-segunda` e `-qa` em HEAD destacado; o Maestro os posiciona a cada tarefa.
- Worktrees extras, limpos e não previstos no PAPEIS: `.kilo/worktrees/pushy-radar` (`a3465e8`) e dois na pasta temporária da sessão anterior do Maestro (`wt-docs`, `wt-e0`); `-dev2` (usado no teste E0-T05). Remover só com ok do Rodrigo.
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
- (21/10) Merges de #13 a #17 e #19 delegados ao Maestro pelo Rodrigo. CI: não cancela runs na `main` e timeout de 15 min (#16).
- (24/10) Delegação ao Maestro: menos aprovações, mais desenvolvimento (PAPEIS). Merges de #20 e #21 pelo Maestro.
- (24/10) E0-T05: **DeepSeek V4.1 Flash vence o Kimi K2.7 Code** e vira o Dev até a E2; o Revisor passa a Kimi K2.7 Code (#20). Ver VALIDACOES.
- (24/10) E0-T00: painel `bun run task` / `painel` / `status` na `main` (#21).
- (21/10) E0-T08: três arquivos `.ts` estavam commitados com CRLF e um CR solto no final, o que fazia o git tratá-los como binários; convertidos para LF sem mudança de conteúdo (#17).

## A acompanhar

- Sugestão da Segunda opinião na E0-T09: override também de `react`, `react-dom` e `react-query` (versão única no lock). Decisão (24/10): fica para depois.
- As actions do CI rodam em Node 20, que o GitHub está descontinuando; atualizar o SHA de `actions/checkout` e `oven-sh/setup-bun` quando houver versão em Node 24.

## Pendências do Rodrigo

- Licença e manual COPSOQ (P-T01).

<!-- painel:inicio -->
### E0 — Fundação

| Estado | Quantidade | Tarefas |
|---|---|---|
| a_fazer | 0 | — |
| em_andamento | 0 | — |
| em_revisao | 0 | — |
| em_qa | 0 | — |
| aguardando_rodrigo | 2 | E0-T00, E0-T05 |
| concluida | 8 | E0-T01, E0-T02, E0-T03, E0-T04, E0-T06, E0-T07, E0-T08, E0-T09 |
| bloqueada | 0 | — |

### E1 — Rede de segurança do domínio

| Estado | Quantidade | Tarefas |
|---|---|---|
| a_fazer | 12 | E1-T00a, E1-T00b, E1-T00c, E1-T00d, E1-T01, E1-T02, E1-T03, E1-T04, E1-T05, E1-T00e, E1-T08, E1-T09 |
| em_andamento | 0 | — |
| em_revisao | 0 | — |
| em_qa | 0 | — |
| aguardando_rodrigo | 0 | — |
| concluida | 0 | — |
| bloqueada | 0 | — |

### E2 — Fluxo ponta a ponta

_Sem tarefas._

### E3 — Backend real

_Sem tarefas._

### E4 — Coleta anônima

_Sem tarefas._

### E5 — Login e multiempresa

_Sem tarefas._

### E6 — Riscos, ações e relatório no servidor + auditoria

_Sem tarefas._

### E7 — IA real nas sugestões

_Sem tarefas._

### P — Trilha paralela

_Sem tarefas._
<!-- painel:fim -->
