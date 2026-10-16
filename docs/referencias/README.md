# Referências documentais

Base de consulta para decisões de produto, metodologia e revisão. Os agentes leem os **resumos**; o PDF só é aberto para confirmar um ponto, sempre citando a página.

| Documento                                                                                         | Tipo      | PDF                                                              | Resumo                                                          |
| ------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------- | --------------------------------------------------------------- |
| Guia de Informações sobre os Fatores de Riscos Psicossociais Relacionados ao Trabalho (MTE, 2025) | Oficial   | [no repositório](mte-guia-fatores-riscos-psicossociais-2025.pdf) | [RESUMO-guia-mte.md](RESUMO-guia-mte.md) (IDs G-xx)             |
| Manual de interpretação e aplicação do capítulo 1.5 da NR-1 — GRO (MTE, 2026)                     | Oficial   | [no repositório](mte-manual-gro-nr1-2026.pdf)                    | [RESUMO-manual-gro-nr1.md](RESUMO-manual-gro-nr1.md) (IDs M-xx) |
| COPSOQ II — versão portuguesa (manual)                                                            | Terceiros | só local, em `privadas/`                                         | [RESUMO-copsoq-pt.md](RESUMO-copsoq-pt.md) (IDs C-xx)           |
| Normas que embasam o kit (lista)                                                                  | Terceiros | só local, em `privadas/`                                         | [RESUMO-normas-kit.md](RESUMO-normas-kit.md)                    |

Os dois documentos do MTE autorizam a reprodução desde que citada a fonte. Os de terceiros ficam em `docs/referencias/privadas/`, que está no `.gitignore`.

**Comparação com o protótipo:** [LACUNAS.md](LACUNAS.md) — o que já atende, o que falta (L-xx) e os conflitos a decidir (X-xx).

## Regras

1. Citar a referência pelo ID e pela página ao justificar uma decisão ou apontar um desvio.
2. Não copiar itens de questionários de terceiros (COPSOQ ou outros) para o código ou a documentação.
3. Os subitens da NR-1 citados nos resumos vêm dos documentos do MTE; o texto da NR-1 em si ainda não foi conferido.
4. Documento novo entra com resumo no mesmo formato e atualização do LACUNAS.md.
