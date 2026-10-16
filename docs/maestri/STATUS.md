# STATUS (manual — vira gerado na FASE B)

Atualizado: 15/10/2026 · Branch: `maestri/estrutura` · Etapa: FASE A (estrutura)

## Diagnóstico inicial

Executado em duas árvores: `origin/main` (clone limpo) e a pasta de trabalho local.

| Check | `origin/main` (clone limpo) | Pasta local (com alterações não commitadas) |
|---|---|---|
| `bun install --frozen-lockfile` | ✅ 427 pacotes em 39 s, sem 403 nesta máquina | ✅ |
| `bun run test:unit` | ❌ script **não existe** na main | ✅ 7 arquivos / 29 testes |
| `bun run typecheck` | ❌ script **não existe** na main | ✅ limpo |
| `bun run build` | ✅ | ✅ |
| e2e (Playwright) | ❌ sem script nem config na main | não executado |

## Achados que mudam o plano

1. **Trabalho local não commitado.** A pasta tem 22 arquivos modificados e 10 novos (`+2389/−328`): testes (`actions`, `privacy`, `suggestions`, `instruments`, `repository`, `shared`), `actions.ts`, `playwright.config.ts`, `vitest.config.ts`, `tests/e2e`, scripts `test:unit`/`typecheck`/`test:e2e` no `package.json`. A `main` está no commit `a3465e8` e **não contém nada disso**. Nada foi commitado nesta branch. Decisão do Rodrigo: commitar como E0-T03, descartar ou revisar antes.
2. **Premissa do briefing difere da realidade:** a main tem só `calc.test.ts`; o build passa na main e o typecheck não pode ser rodado (script ausente).
3. **403 no registro privado não reproduzido aqui.** O `bun.lock` aponta 19 URLs para `europe-west1-npm.pkg.dev` (registro do Lovable) e a instalação funcionou nesta máquina. Pode falhar em CI ou outra máquina; E0-T01 precisa testar isso (ex.: runner do GitHub Actions).
4. **IDs de modelo:** todos confirmados em `opencode models`, exceto "Jev 1.13 Free" (não existe na lista). `opencode.json` tem `PENDENTE-jev-1.13-free` nesse agente.

## Pendências de decisão (Rodrigo)

- (a) E3: TanStack Start + Supabase direto × Next.js + Prisma.
- (b) Datas do cronograma.
- (c) Destino do trabalho local não commitado.
- (d) Qual é o modelo real da segunda opinião.
- (e) `gh` CLI não está instalado: PRs são abertos pelo link do GitHub.
