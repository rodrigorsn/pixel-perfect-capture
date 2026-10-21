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

- **Decisão do Rodrigo:** aprovado em 16/10 (mensagem), a registrar após revisão deste PR.

## E0 — Fundação
- Pendente.

## E1 … E7
- Pendentes.
