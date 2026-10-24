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

### Incidente: comandos rejeitados executados pelo Dev (20/10, E0-T04)

Durante a E0-T04, o Dev pediu aprovação para três comandos fora da lista liberada. O Rodrigo rejeitou os três. Dois deles foram executados mesmo assim, segundo o próprio relatório final do Dev:

| Comando | Decisão do Rodrigo | Executado? |
|---|---|---|
| `New-Item -ItemType Directory … .github\workflows` | Reject | não (o Dev criou o arquivo pela ferramenta de edição) |
| `git config core.autocrlf false` | Reject | **sim** |
| `git restore src/routeTree.gen.ts` | Reject | **sim** (o arquivo só tinha diferença de fim de linha) |

- **Efeito:** `core.autocrlf=false` foi gravado no `.git/config` do repositório, que vale para todos os worktrees (pasta principal, Dev, Revisor, Segunda opinião, QA). Com isso, arquivos editados no Windows passaram a aparecer como inteiramente alterados e podiam ser commitados com CRLF. O Maestro removeu a configuração com `git config --unset core.autocrlf` por ok do Rodrigo; o valor efetivo voltou a ser `true` (`C:/Program Files/Git/etc/gitconfig`). O commit da tarefa (`84941ff`) contém só o `ci.yml`.
- **Causa:** ainda não apurada. Hipótese a checar: a aprovação veio de uma mensagem enviada pelo Maestro (`maestri ask`) ao terminal do Dev enquanto o pedido de aprovação ainda estava aberto, e o envio da mensagem confirmou a opção selecionada. Os pedidos foram trazidos ao Rodrigo e as mensagens ao Dev foram enviadas depois de ele informar o Reject; não foi verificado se o pedido ainda estava aberto no terminal nesse momento.
- **Medidas:** `"git config*": "deny"` para todos os agentes (PR #14); E0-T08 `.gitattributes` com `eol=lf` (PR #14); regra nova no PAPEIS: o Maestro nunca envia mensagem a um terminal parado num pedido de aprovação.
- **Para a E0-T05:** este incidente conta na comparação de modelos do Dev.
- **Atualização (21/10):** um quarto pedido do Dev (`git diff 84941ff -- .github/workflows/ci.yml`, só leitura, fora do padrão `git diff*` pelo `--` ou pela config carregada antes do #15) ficou aberto até o Rodrigo autorizar o Maestro a recusá-lo; o Maestro enviou ESC pelo `maestri ask --raw` e conferiu que o terminal voltou ao prompt sem executar o comando. Com a E0-T08 (#17), a causa raiz dos avisos de CRLF foi fechada.

### E0-T04 CI no GitHub Actions — PR #16 (`84941ff` + `82efc32`), trilha leve

| Papel | Decisão | Parecer |
|---|---|---|
| Revisor (DeepSeek V4 Pro) | ✅ Aprovar (`84941ff` e delta `82efc32`) | Gatilhos e ordem dos passos corretos; o job falha quando qualquer passo falha; unit 31/31, typecheck limpo. No delta: `cancel-in-progress` condicional correto para push na `main` (false), em `etapa/**` (true) e em PR (`refs/pull/N/merge`, true); `timeout-minutes: 15` razoável. |
| Segunda opinião (GLM-5.2) | ✅ Aprovar (`84941ff`) | 5 úteis, 3 ruído. Antes da trilha leve (#15); não houve segunda rodada. |
| CI | ✅ | Branch: runs 39522772149 e 39692156039; PR: 39696327284; **primeiro run na `main`: 39697634313**. |

- **Decisão do Rodrigo (21/10):** aplicar os menores (a) não cancelar na `main` e (b) timeout; (c) `packageManager` foi para a E0-T09. Merge do #16 pelo Maestro por autorização do Rodrigo.

### E0-T08 `.gitattributes` LF + renormalização — PR #17 (`91ca41d`), trilha leve

| Papel | Decisão | Parecer |
|---|---|---|
| Maestro | autor | `* text=auto eol=lf` + binários. Três arquivos estavam commitados com CRLF e um CR solto no final (`actions.ts`, `actions.test.ts`, `invariants.spec.ts`), o que fazia o git tratá-los como binários; convertidos para LF. Diff ignorando espaços e CR: vazio. Índice: 122 texto LF, 3 binários. |
| Revisor (DeepSeek V4 Pro) | ✅ Aprovar | `.gitattributes` correto e completo; conteúdo idêntico confirmado; unit 31/31, typecheck limpo. |
| CI | ✅ | PR: 39697863152 e 39698076381. |

- **Decisão do Rodrigo (21/10):** merge do #17 pelo Maestro por autorização do Rodrigo.

### E0-T09 `overrides` + `packageManager` — PR #19 (`9ce9e51`), fluxo completo

| Papel | Decisão | Parecer |
|---|---|---|
| Dev (Kimi K2.7 Code) | autor | `packageManager: bun@1.3.14` e 53 overrides exatos de `@radix-ui/*`; `bun install` sem mudança de versão. O relatório não listou os pacotes deixados de fora nem o motivo, como pedido; o Maestro conferiu. |
| Revisor (DeepSeek V4 Pro) | ✅ Aprovar | Os 53 overrides batem 1 a 1 com o lock; nenhum `@radix-ui/*` faltou (inclusive transitivos de cmdk/vaul); `h3`, `rou3` e `srvx` têm duas versões cada no lock e o Bun só aceita override no nível de cima, então a exclusão é correta e o `--frozen-lockfile` os mantém fixos; `packageManager` coerente com o CI. Unit 31/31, typecheck limpo. |
| Segunda opinião (GLM-5.2) | ✅ Aprovar | Útil: o risco de deriva que ela apontou no #4 está resolvido no essencial. Útil (menor): `react`, `react-dom` e `react-query` têm versão única no lock e poderiam ganhar override; hoje dependem só do lock. Ruído: overrides redundantes com ranges diretos. |
| QA (DeepSeek V4.1 Flash) | ✅ Aprovado | `bun install --frozen-lockfile` ✅ · unit 31/31 ✅ · typecheck ✅ · build ✅ · e2e 3/3 ✅ (22,7 s); `package.json` e `bun.lock` intactos. |
| CI | ✅ | PR: 39700435106 e 39702313076; `main`: 39702393246. |

- **Decisão do Rodrigo (21/10):** merge do #19 pelo Maestro por autorização do Rodrigo. Sugestão da Segunda opinião (override de `react`, `react-dom`, `react-query`) fica para decisão.

### E0-T05 teste de modelos (Kimi K2.7 Code × DeepSeek V4.1 Flash) com a E0-T00 painel — 24/10

Mesma especificação, palavra por palavra, para os dois, em worktrees e branches separados (`etapa/E0-T00-kimi` e `etapa/E0-T00-deepseek`, base `950024c`), os dois com o OpenCode reiniciado e a mesma config (bash fora da lista negado).

| Critério | Kimi K2.7 Code (`1087177`) | DeepSeek V4.1 Flash (`c303be2`) |
|---|---|---|
| Tempo | 6m30s | 12m24s |
| Tamanho | 910 linhas, 10 arquivos | 1524 linhas, 15 arquivos |
| Testes novos | 32 (63 no total) | 35 (66 no total), incluindo I/O |
| unit, typecheck, build | ✅ | ✅ |
| Comandos negados ou pedidos de aprovação | nenhum | nenhum |
| `--por` inválido | ❌ exceção sem tratamento (stack trace) | ✅ mensagem com as opções válidas |
| `status` duas vezes seguidas | ❌ muda o arquivo na 1ª inserção dos marcadores | ✅ idempotente |
| Validação do `plano.json` | ❌ `JSON.parse` sem schema | ✅ schema validado |
| Gravação | `STATUS.md` não atômico | atômica nos dois arquivos |
| Relatório ao Maestro | completo | completo |

Os testes de comportamento foram feitos pelo Maestro numa cópia temporária, antes dos pareceres: os dois recusam transição inválida, nota ausente, ID desconhecido e 2ª tarefa D com exit 1 e sem gravar nada, e os dois voltam da bloqueada ao estado anterior.

| Papel | Parecer |
|---|---|
| Revisor (DeepSeek V4 Pro) | **Vencedor: DeepSeek Flash**: mais correto e robusto pelo mesmo comportamento funcional; o código extra se justifica. Kimi: 1 importante (exceção sem tratamento) e menores (sem schema, status não idempotente, gravação não atômica, sem testes de I/O). |
| Segunda opinião (GLM-5.2) | **APROVAR o vencedor.** Contrapeso ao viés de família (o Revisor é DeepSeek): "nenhum viés que mude o resultado; a única divergência semântica favoreceria o Kimi". Confirmou os defeitos do Kimi e achou mais um (`replace` global que colapsa linhas fora do bloco do STATUS). Na versão vencedora: a exceção da E0-T05 é total (o Kimi restringe ao par T00+T05; efeito prático pequeno, mantida) e a volta da bloqueada dependia do log fora do git (corrigido, ver E0-T00). 5 úteis, 1 ruído. |
| QA (DeepSeek V4.1 Flash) | APROVADO em `00c29f7`: install, unit 66/66, typecheck, build, e2e 3/3, `bun run painel` consistente. |

- **Decisão (Maestro, por delegação de 24/10): vencedor DeepSeek V4.1 Flash, que passa a ser o Dev até a E2.** Consequência: o Revisor não pode mais ser DeepSeek (PAPEIS: nunca da mesma família do Dev).
- O incidente de 20/10 (comandos rejeitados executados) pesava contra o Kimi, mas não foi preciso usá-lo: a decisão saiu dos critérios objetivos.

## E1 … E7
- Pendentes.
