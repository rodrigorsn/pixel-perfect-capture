import process from "node:process";
import { criarArquivos, raizDoProjeto } from "./io.ts";
import { analisarPlano } from "./plano.ts";
import { renderizarPainel } from "./quadro.ts";
import { mensagemDeErro } from "./operacoes.ts";

async function main(): Promise<void> {
  const arquivos = criarArquivos(raizDoProjeto());
  const texto = await arquivos.lerPlano();

  if (texto === null) {
    console.error("docs/maestri/plano.json não encontrado.");
    process.exitCode = 1;
    return;
  }

  console.log(renderizarPainel(analisarPlano(texto)));
}

main().catch((erro: unknown) => {
  console.error(mensagemDeErro(erro));
  process.exitCode = 1;
});
