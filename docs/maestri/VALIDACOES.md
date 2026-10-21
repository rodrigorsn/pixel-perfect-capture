# Validações

Registro por etapa: data, quem validou, evidências (comandos com saída resumida, prints) e decisão do Rodrigo.

## Pré-etapa — Diagnóstico inicial (15/10/2026, Maestro)

Ver `STATUS.md` para o estado completo. Evidências resumidas no resultado dos comandos lá.

- **Decisão do Rodrigo:** pendente.

## Teste de permissões dos agentes (16/10/2026, Maestro)

Agentes reiniciados com `opencode-go` (OpenCode 1.19.3), worktrees em HEAD destacado em `5112be5` (Dev na branch `etapa/E0-T03-baseline-local`). Modelos: Dev Kimi K2.7 Code, Revisor DeepSeek V4 Pro, Segunda opinião GLM-5.2, QA DeepSeek V4.1 Flash. Todos responderam ao prompt de abertura e ficaram aguardando tarefa.

| Teste | Esperado | Resultado |
|---|---|---|
| Revisor edita `README.md` via shell (`Add-Content`) | bloqueado | ✅ bloqueado: "This tool call is prevented by a permission rule" |
| Revisor edita `README.md` pela ferramenta nativa | bloqueado | ✅ bloqueado: a ferramenta de edição não está disponível ao agente |
| QA executa `git push --dry-run origin HEAD` | bloqueado | ✅ bloqueado pela regra `git push*` → deny |

Worktrees do Revisor e do QA seguiram limpos (0 alterações) após os testes. Observações: o teste do Revisor foi pedido por prompt, não por ação espontânea; o "dry-run" foi usado no push para não haver efeito caso a regra falhasse. A Segunda opinião e o Dev não foram testados (somente leitura / push só em `etapa/*`).

- **Decisão do Rodrigo:** aprovado em 16/10 (mensagem); PR #9 mergeado em 20/10.

## E0 — Fundação

### E0-T07 desvincular do Lovable (+ E0-T01) — PR #4, revisado em `ae88ff8`

| Papel | Decisão | Parecer |
|---|---|---|
| Revisor (DeepSeek V4 Pro) | ✅ Aprovar | Paridade do `vite.config.ts`: a config própria mantém tudo o que o plugin Lovable fazia (tanstackStart, React, Tailwind, tsconfig paths, nitro, alias `@`, dedupe, `VITE_*`, porta 8080), exceto devtools do TanStack (só dev, perda menor) e o error logger (remoção intencional, boa para privacidade). Cadeia de suprimentos: nenhuma URL `pkg.dev` restante; nenhum pacote novo suspeito (só transitivos `@emnapi/*`, `@napi-rs/wasm-runtime`); integridade sha512 em todas as entradas. Importante: deriva de versões no `bun.lock`. Menor: `bun.lock:6` com o nome antigo. |
| Segunda opinião (GLM-5.2) | ✅ Aprovar, condicionado a unit + e2e verdes | Útil: a deriva entra em produção: `h3`, `rou3`, `srvx` (runtime SSR) e ~20 minors no cliente (`@radix-ui`, `react-query`, `react` 19.3.1); `vitest`, `playwright` e afins são só dev. Severidade importante. Causa: lock regenerado ao sair do registro privado; nitro, vite e tanstack seguem fixos. Sugere fixar `h3`/`rou3`/`srvx`/`@radix-ui` via `overrides`. |
| QA (DeepSeek V4.1 Flash) | ✅ Aprovado, com nota de ambiente | install ✅ · test:unit ✅ 7 arquivos / 31 testes · typecheck ✅ · build ✅ (client + SSR + nitro) · test:e2e ✅ 3/3, depois de instalar o ffmpeg do Playwright 1.64 (falha de ambiente, não de código). Nota: em CI ou ambiente limpo, instalar o ffmpeg no setup. |

- **Decisão do Rodrigo (20/10):** aceitar a deriva agora; fixar as versões via `overrides` numa tarefa separada, depois da E0-T04. Merge do #4 feito pelo Maestro por delegação do Rodrigo, em 20/10.
- Pendência registrada: Rodrigo desconecta o projeto no Lovable e revoga o GitHub App (confirmado como feito em 20/10).

## E1 … E7
- Pendentes.
