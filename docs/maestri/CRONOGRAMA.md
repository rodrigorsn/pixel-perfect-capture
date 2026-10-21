# Cronograma

Dev solo, cerca de 1 etapa por semana. Datas de 2026. Papéis: **D** Dev, **R** Revisor, **Q** QA, **M** Maestro, **P** Rodrigo.

## E0 — Fundação (16–17/out)
- **Objetivo:** repo reproduzível, verificável e com painel de controle.
- **Entregável:** clonar do zero e `bun install && bun run build` sem erro; CI verde.
- **Tarefas:**
  - E0-T00 painel `bun run task` / `bun run painel` (D)
  - E0-T01 instalação reproduzível fora do Lovable (D)
  - E0-T02 typecheck limpo (D)
  - E0-T03 scripts `test` e `typecheck` na `main` (D)
  - E0-T04 CI GitHub Actions: test + typecheck + build (D)
  - E0-T05 teste de modelos Kimi K2.7 Code × DeepSeek V4.1 Flash na mesma tarefa; Revisor compara; vencedor vira Dev até a E2 (D, R, M)
  - E0-T06 decidir destino do trabalho local não commitado: preservado em `etapa/E0-T03-baseline-local` (P, M)
  - E0-T07 desvincular do Lovable: vite.config próprio, sem telemetria, lock no npm público (D) — branch `etapa/E0-T07-desvincular-lovable`, empilhada sobre a E0-T03
- **Pronto:** CI verde na `main`; VALIDACOES registra o vencedor do teste.
- **Roteiro (5 min):** `git clone` → `bun install` → `bun run test && bun run typecheck && bun run build`; abrir a aba Actions e ver o run verde.

## E1 — Rede de segurança do domínio (19–23/out)
- **Objetivo:** travar o comportamento do domínio com testes de borda.
- **Entregável:** suíte verde.
- **Tarefas:**
  - **Primeiras tarefas da E1, nesta ordem (pendências da revisão do PR #3):**
    - E1-T00a `repository.load` reaplica o piso de 5 do tamanho mínimo de grupo a valores antigos do `localStorage` (`repository.ts` ~27); privacidade, com teste (D)
    - E1-T00b store: `useRef` com o estado mais recente; `update()` com retorno verificado na aprovação, no envio de resposta e no "Salvo" (`store.tsx` ~33, `pages.tsx` ~64, ~1205) (D)
    - E1-T00c testes sintéticos da supressão complementar: ≥3 escopos com contagens controladas, direto em `campaignResults` (D)
    - E1-T00d gate `hydrated` em todas as páginas que gravam, incluindo `ReportsPage` (~1855), e aviso no cadastro de risco sem campanha de origem (~827, ~1191) (D)
  - E1-T01 calc: normalização e itens invertidos (D)
  - E1-T02 calc: mínimo 2 de 3 itens, mínimo 3 participantes, ausência ≠ zero (D)
  - E1-T03 privacy: mínimo do grupo + supressão complementar (D)
  - E1-T04 suggestions: nunca aprova sozinho, nunca recebe dado individual (D)
  - E1-T05 congelamento do instrumento na abertura da campanha (D)
- **Pronto:** casos de borda cobertos; Revisor aprova invariantes.
- **Roteiro:** `bun run test` → ver os arquivos calc/privacy/suggestions/instruments verdes; quebrar um limiar de propósito e ver o teste falhar.

## E2 — Fluxo ponta a ponta (26–30/out)
- **Objetivo:** Playwright cobrindo o fluxo completo.
- **Entregável:** `bun run e2e` verde, com vídeo.
- **Tarefas:**
  - E2-T01 e2e empresa → campanha → abrir (D)
  - E2-T02 e2e responder no celular (viewport mobile) → encerrar (D)
  - E2-T03 e2e resultados → risco → ação aprovada → relatório (D)
  - E2-T04 script `e2e` e vídeo de evidência (D, Q)
- **Pronto:** fluxo inteiro verde em Chromium.
- **Roteiro:** `bun run e2e` e abrir o vídeo em `test-results/`.

## E3 — Backend real (03–13/nov)
- **Objetivo:** banco com RLS substituindo o localStorage mantendo a interface do `repository`.
- **Entregável:** dados persistem entre navegadores (empresa, setores, campanhas).
- **Tarefas:**
  - E3-T01 plano de migração + scaffolding Next.js (ver [ADR-0001](ADR-0001-next-prisma.md): decidido Next.js + Prisma) (D, M)
  - E3-T02 schema Prisma + RLS/isolamento (D)
  - E3-T03 adaptador do repository sobre Prisma, domínio portado sem alteração (D)
  - E3-T04 migração dos dados demo (D)
- **Pronto:** e2e da E2 verde contra o adaptador.
- **Roteiro:** criar empresa no Chrome, abrir no Firefox e ver a mesma.

## E4 — Coleta anônima (16–27/nov)
- **Objetivo:** coleta que preserva anonimato de verdade.
- **Entregável:** 6 respostas de dispositivos diferentes aparecem só agregadas; com 4, o grupo aparece suprimido.
- **Tarefas:**
  - E4-T01 modelo de ameaça de anonimato (M, R)
  - E4-T02 convites sem identificação (D)
  - E4-T03 respostas gravadas no servidor (D)
  - E4-T04 unicidade sem rastrear a pessoa (D)
  - E4-T05 agregação e supressão no servidor (D)
- **Pronto:** revisão de anonimato aprovada.
- **Roteiro:** enviar 4 e depois 6 respostas e conferir a supressão.

## E5 — Login e multiempresa (30/nov–04/dez)
- **Entregável:** usuário da empresa A não enxerga nada da B.
- **Tarefas:** E5-T01 autenticação (D); E5-T02 isolamento por empresa (D); E5-T03 perfis admin e responsável SST (D).
- **Roteiro:** logar com dois usuários e tentar acessar IDs cruzados.

## E6 — Riscos, ações e relatório no servidor + auditoria (07–11/dez)
- **Entregável:** histórico de quem aprovou o quê e quando.
- **Tarefas:** E6-T01 riscos e ações no servidor (D); E6-T02 relatório no servidor (D); E6-T03 trilha de auditoria (D).
- **Roteiro:** aprovar uma ação e ver o registro de auditoria.

## E7 — IA real nas sugestões (14–18/dez)
- **Entregável:** sugestão gerada → editada → aprovada, com log.
- **Tarefas:** E7-T01 provedor no servidor (D); E7-T02 só agregados liberados + validação de saída (D, R); E7-T03 aprovação humana obrigatória e log (D).
- **Roteiro:** gerar, editar e aprovar uma sugestão e ver o log.

## P — Trilha paralela (sem código)
- P-T01 instrumento validado: licença e manual COPSOQ, adaptação brasileira. **Bloqueada: aguardando licença e manual COPSOQ** (P).
