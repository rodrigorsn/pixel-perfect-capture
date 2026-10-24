import { randomUUID } from "node:crypto";
import { appendFile, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Evento } from "./modelo.ts";

export function raizDoProjeto(): string {
  return fileURLToPath(new URL("../..", import.meta.url));
}

export interface ArquivosPainel {
  lerPlano(): Promise<string | null>;
  gravarPlano(texto: string): Promise<void>;
  lerEventos(): Promise<string | null>;
  acrescentarEvento(evento: Evento): Promise<void>;
  lerStatus(): Promise<string | null>;
  gravarStatus(texto: string): Promise<void>;
}

function codigoDeErro(erro: unknown): string | undefined {
  if (typeof erro !== "object" || erro === null) return undefined;
  const codigo = (erro as { code?: unknown }).code;
  return typeof codigo === "string" ? codigo : undefined;
}

async function ler(caminho: string): Promise<string | null> {
  try {
    return await readFile(caminho, "utf8");
  } catch (erro) {
    if (codigoDeErro(erro) === "ENOENT") return null;
    throw erro;
  }
}

async function gravarAtomico(caminho: string, texto: string): Promise<void> {
  const pasta = dirname(caminho);
  await mkdir(pasta, { recursive: true });
  const temporario = join(pasta, `.${basename(caminho)}.${randomUUID()}.tmp`);

  try {
    await writeFile(temporario, texto, "utf8");
    await rename(temporario, caminho);
  } catch (erro) {
    await rm(temporario, { force: true });
    throw erro;
  }
}

export function criarArquivos(raiz: string): ArquivosPainel {
  const caminhoPlano = join(raiz, "docs", "maestri", "plano.json");
  const caminhoLog = join(raiz, ".maestri", "eventos.jsonl");
  const caminhoStatus = join(raiz, "docs", "maestri", "STATUS.md");

  return {
    lerPlano: () => ler(caminhoPlano),
    gravarPlano: (texto) => gravarAtomico(caminhoPlano, texto),
    lerEventos: () => ler(caminhoLog),
    acrescentarEvento: async (evento) => {
      await mkdir(dirname(caminhoLog), { recursive: true });
      await appendFile(caminhoLog, `${JSON.stringify(evento)}\n`, "utf8");
    },
    lerStatus: () => ler(caminhoStatus),
    gravarStatus: (texto) => gravarAtomico(caminhoStatus, texto),
  };
}
