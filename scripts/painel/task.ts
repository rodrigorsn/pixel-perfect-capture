import process from "node:process";
import { criarArquivos, raizDoProjeto } from "./io.ts";
import { consultarTarefa, executarMudanca, mensagemDeErro } from "./operacoes.ts";

const USO = [
  'Uso: bun run task <ID> <estado> --por <Maestro|Dev|Revisor|Segunda|QA|Rodrigo> [--nota "texto"]',
  "     bun run task <ID>",
].join("\n");

interface Flags {
  por: string;
  nota?: string;
}

type ResultadoFlags = { ok: true; flags: Flags } | { ok: false; erro: string };

function analisarFlags(args: string[]): ResultadoFlags {
  let por: string | undefined;
  let nota: string | undefined;

  for (let indice = 0; indice < args.length; indice += 1) {
    const arg = args[indice];
    if (arg !== "--por" && arg !== "--nota") {
      return { ok: false, erro: `Argumento desconhecido: ${arg}.` };
    }

    const valor = args[indice + 1];
    if (valor === undefined) {
      return { ok: false, erro: `${arg} exige um valor.` };
    }

    if (arg === "--por") {
      if (por !== undefined) return { ok: false, erro: "--por foi informado mais de uma vez." };
      por = valor;
    } else {
      if (nota !== undefined) return { ok: false, erro: "--nota foi informada mais de uma vez." };
      nota = valor;
    }

    indice += 1;
  }

  if (por === undefined) return { ok: false, erro: "--por é obrigatório." };
  return { ok: true, flags: nota === undefined ? { por } : { por, nota } };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const arquivos = criarArquivos(raizDoProjeto());

  if (args.length === 0) {
    console.error(USO);
    process.exitCode = 1;
    return;
  }

  const id = args[0];
  if (id === undefined || id.startsWith("--")) {
    console.error(USO);
    process.exitCode = 1;
    return;
  }

  if (args.length === 1) {
    const resultado = await consultarTarefa(arquivos, id);
    if (!resultado.ok) {
      console.error(resultado.erro);
      process.exitCode = 1;
      return;
    }
    console.log(resultado.texto);
    return;
  }

  const estado = args[1];
  if (estado === undefined || estado.startsWith("--")) {
    console.error(USO);
    process.exitCode = 1;
    return;
  }

  const flags = analisarFlags(args.slice(2));
  if (!flags.ok) {
    console.error(flags.erro);
    process.exitCode = 1;
    return;
  }

  const resultado = await executarMudanca(
    arquivos,
    {
      id,
      para: estado,
      por: flags.flags.por,
      ...(flags.flags.nota === undefined ? {} : { nota: flags.flags.nota }),
    },
    new Date(),
  );

  if (!resultado.ok) {
    console.error(resultado.erro);
    process.exitCode = 1;
    return;
  }

  console.log(`${id}: ${resultado.de} → ${resultado.para} (${flags.flags.por})`);
}

main().catch((erro: unknown) => {
  console.error(mensagemDeErro(erro));
  process.exitCode = 1;
});
