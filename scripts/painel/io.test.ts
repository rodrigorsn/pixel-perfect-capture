import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { criarArquivos } from "./io.ts";
import type { Evento } from "./modelo.ts";

const raizes: string[] = [];

async function raizTemporaria(): Promise<string> {
  const raiz = await mkdtemp(join(tmpdir(), "painel-teste-"));
  raizes.push(raiz);
  return raiz;
}

afterEach(async () => {
  await Promise.all(raizes.splice(0).map((raiz) => rm(raiz, { recursive: true, force: true })));
});

describe("arquivos do painel", () => {
  it("grava o plano de forma atômica e lê o STATUS pelo caminho injetado", async () => {
    const raiz = await raizTemporaria();
    const arquivos = criarArquivos(raiz);

    expect(await arquivos.lerPlano()).toBeNull();
    expect(await arquivos.lerStatus()).toBeNull();

    await arquivos.gravarPlano("primeiro\n");
    expect(await arquivos.lerPlano()).toBe("primeiro\n");

    await arquivos.gravarPlano('{"versao":1}\n');
    expect(await arquivos.lerPlano()).toBe('{"versao":1}\n');

    await arquivos.gravarStatus("# STATUS\n");
    expect(await arquivos.lerStatus()).toBe("# STATUS\n");

    expect((await readdir(join(raiz, "docs", "maestri"))).sort()).toEqual(["STATUS.md", "plano.json"]);
  });

  it("acrescenta eventos sem sobrescrever o log", async () => {
    const raiz = await raizTemporaria();
    const arquivos = criarArquivos(raiz);
    const primeiro: Evento = {
      ts: "2026-10-24T11:00:00.000Z",
      tarefa: "E0-T00",
      de: "a_fazer",
      para: "em_andamento",
      por: "Dev",
    };
    const segundo: Evento = {
      ts: "2026-10-24T12:00:00.000Z",
      tarefa: "E0-T00",
      de: "em_andamento",
      para: "em_revisao",
      por: "Dev",
      nota: "pronto para revisão",
    };

    expect(await arquivos.lerEventos()).toBeNull();
    await arquivos.acrescentarEvento(primeiro);
    await arquivos.acrescentarEvento(segundo);

    const linhas = ((await arquivos.lerEventos()) ?? "").trim().split("\n");
    expect(linhas).toHaveLength(2);
    expect(JSON.parse(linhas[0] ?? "")).toMatchObject({ tarefa: "E0-T00", para: "em_andamento" });
    expect(JSON.parse(linhas[1] ?? "")).toMatchObject({ para: "em_revisao", nota: "pronto para revisão" });
  });
});
