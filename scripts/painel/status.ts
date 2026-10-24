import process from "node:process";
import { criarArquivos, raizDoProjeto } from "./io.ts";
import { executarStatus, mensagemDeErro } from "./operacoes.ts";

async function main(): Promise<void> {
  const resultado = await executarStatus(criarArquivos(raizDoProjeto()));

  if (!resultado.ok) {
    console.error(resultado.erro);
    process.exitCode = 1;
    return;
  }

  console.log(resultado.alterado ? "STATUS.md atualizado." : "STATUS.md sem mudanças.");
}

main().catch((erro: unknown) => {
  console.error(mensagemDeErro(erro));
  process.exitCode = 1;
});
