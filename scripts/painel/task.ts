import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { lerEventos, lerPlano, gravarPlano, acrescentarEvento } from "./io";
import { formatarConfirmacao, formatarDetalheTarefa, validarTransicao } from "./logic";
import type { Estado, Pessoa } from "./types";
import { ESTADOS, PESSOAS_VALIDAS } from "./types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(dirname(__dirname));
const caminhoPlano = join(root, "docs", "maestri", "plano.json");
const caminhoEventos = join(root, ".maestri", "eventos.jsonl");

function mostrarUso(): string {
  return `Uso:\n  bun run task <ID> <estado> --por <Maestro|Dev|Revisor|Segunda|QA|Rodrigo> [--nota "texto"]\n  bun run task <ID>`;
}

interface ParsedArgs {
  id: string;
  estado?: Estado;
  por?: Pessoa;
  nota?: string | undefined;
}

function parseArgs(argv: string[]): ParsedArgs {
  const id = argv[0];
  if (!id) {
    throw new Error(mostrarUso());
  }

  if (argv.length === 1) {
    return { id };
  }

  const estado = argv[1] as Estado;
  if (!ESTADOS.includes(estado)) {
    throw new Error(`estado inválido: ${argv[1]}`);
  }

  let por: Pessoa | undefined;
  let nota: string | undefined;

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--por") {
      const val = argv[++i];
      if (!val || !(PESSOAS_VALIDAS as readonly string[]).includes(val)) {
        throw new Error(`--por inválido: ${val}`);
      }
      por = val as Pessoa;
    } else if (arg === "--nota") {
      const val = argv[++i];
      if (!val) {
        throw new Error("--nota precisa de um valor");
      }
      nota = val;
    }
  }

  if (!por) {
    throw new Error("--por é obrigatório para alterar estado");
  }

  return { id, estado, por, nota };
}

function main(): void {
  const args = process.argv.slice(2);
  const parsed = parseArgs(args);

  const plano = lerPlano(caminhoPlano);
  const eventos = lerEventos(caminhoEventos);

  if (!parsed.estado) {
    const tarefa = plano.tarefas.find((t) => t.id === parsed.id);
    if (!tarefa) {
      console.error(`tarefa não encontrada: ${parsed.id}`);
      process.exit(1);
    }
    process.stdout.write(formatarDetalheTarefa(tarefa, eventos));
    return;
  }

  if (!parsed.estado || !parsed.por) {
    console.error("estado e --por são obrigatórios");
    process.exit(1);
  }

  const resultado = validarTransicao(
    plano,
    parsed.id,
    parsed.estado,
    eventos,
    parsed.por,
    parsed.nota,
  );

  if ("erro" in resultado) {
    console.error(resultado.erro);
    process.exit(1);
  }

  const novoPlano = {
    ...plano,
    tarefas: plano.tarefas.map((t) => (t.id === resultado.tarefa.id ? resultado.tarefa : t)),
  };

  gravarPlano(caminhoPlano, novoPlano);
  acrescentarEvento(caminhoEventos, resultado.evento);
  console.log(formatarConfirmacao(resultado.evento));
}

main();
