<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Decisões arquiteturais do protótipo
- Manter modelos e regras determinísticas em `src/domain`, separados das páginas, para permitir validação e troca da interface.
- Isolar a persistência fictícia em `src/data/repository.ts` para troca futura por API sem depender de `localStorage` nos componentes.
- Manter o contrato de sugestões em `src/domain/suggestions.ts` e o provedor local substituível; nenhum dado individual deve compor seu contexto.
- Usar rotas TanStack Start em `src/routes` e CSS semântico global em `src/styles.css` para preservar navegação e consistência visual.
