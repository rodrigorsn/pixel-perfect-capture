import { describe, expect, it } from "vitest";
import type { ArquivosPainel } from "./io.ts";
import type { Evento } from "./modelo.ts";
import { consultarTarefa, executarMudanca, executarStatus } from "./operacoes.ts";
import { serializarPlano } from "./plano.ts";
import { MARCADOR_INICIO } from "./quadro.ts";

const agora = new Date("2026-10-24T12:00:00.000Z");

class ArquivosFalsos implements ArquivosPainel {
  plano: string | null;
  log: string;
  status: string | null;
  gravacoes: string[] = [];

  constructor(plano: string | null, log = "", status: string | null = null) {
    this.plano = plano;
    this.log = log;
    this.status = status;
  }

  async lerPlano(): Promise<string | null> {
    return this.plano;
  }

  async gravarPlano(texto: string): Promise<void> {
    this.plano = texto;
    this.gravacoes.push("plano");
  }

  async lerEventos(): Promise<string | null> {
    return this.log;
  }

  async acrescentarEvento(evento: Evento): Promise<void> {
    this.log += `${JSON.stringify(evento)}\n`;
    this.gravacoes.push("evento");
  }

  async lerStatus(): Promise<string | null> {
    return this.status;
  }

  async gravarStatus(texto: string): Promise<void> {
    this.status = texto;
    this.gravacoes.push("status");
  }
}

function planoTexto(): string {
  return serializarPlano({
    versao: 1,
    etapas: [{ id: "E0", titulo: "Fundação" }],
    tarefas: [{ id: "E0-T00", etapa: "E0", titulo: "Painel", papel: "D", estado: "em_andamento" }],
  });
}

describe("executar mudança", () => {
  it("grava o plano e acrescenta o evento", async () => {
    const arquivos = new ArquivosFalsos(planoTexto());

    const resultado = await executarMudanca(
      arquivos,
      { id: "E0-T00", para: "em_revisao", por: "Dev" },
      agora,
    );

    expect(resultado).toEqual({ ok: true, de: "em_andamento", para: "em_revisao" });
    expect(arquivos.gravacoes).toEqual(["plano", "evento"]);

    const plano = JSON.parse(arquivos.plano ?? "") as { tarefas: Array<{ estado: string }> };
    expect(plano.tarefas[0]?.estado).toBe("em_revisao");
    expect(JSON.parse(arquivos.log.trim())).toMatchObject({
      tarefa: "E0-T00",
      de: "em_andamento",
      para: "em_revisao",
      por: "Dev",
    });
  });

  it("não grava nada quando a transição é inválida", async () => {
    const arquivos = new ArquivosFalsos(planoTexto(), "", "# STATUS\n");
    const planoAntes = arquivos.plano;

    const resultado = await executarMudanca(
      arquivos,
      { id: "E0-T00", para: "concluida", por: "Dev" },
      agora,
    );

    expect(resultado.ok).toBe(false);
    expect(arquivos.gravacoes).toEqual([]);
    expect(arquivos.plano).toBe(planoAntes);
    expect(arquivos.log).toBe("");
    expect(arquivos.status).toBe("# STATUS\n");
  });

  it("não grava nada quando falta o plano", async () => {
    const arquivos = new ArquivosFalsos(null);

    const resultado = await executarMudanca(
      arquivos,
      { id: "E0-T00", para: "em_revisao", por: "Dev" },
      agora,
    );

    expect(resultado.ok).toBe(false);
    expect(arquivos.gravacoes).toEqual([]);
  });

  it("não grava nada quando o log está corrompido", async () => {
    const arquivos = new ArquivosFalsos(planoTexto(), "{");

    const resultado = await executarMudanca(
      arquivos,
      { id: "E0-T00", para: "em_revisao", por: "Dev" },
      agora,
    );

    expect(resultado.ok).toBe(false);
    expect(arquivos.gravacoes).toEqual([]);
  });
});

describe("consultar tarefa", () => {
  it("mostra o histórico e recusa ID desconhecido", async () => {
    const evento: Evento = {
      ts: "2026-10-24T11:00:00.000Z",
      tarefa: "E0-T00",
      de: "a_fazer",
      para: "em_andamento",
      por: "Dev",
    };
    const arquivos = new ArquivosFalsos(planoTexto(), `${JSON.stringify(evento)}\n`);

    const encontrada = await consultarTarefa(arquivos, "E0-T00");
    expect(encontrada.ok).toBe(true);
    if (encontrada.ok) {
      expect(encontrada.texto).toContain("Histórico:");
      expect(encontrada.texto).toContain("a_fazer → em_andamento (Dev)");
    }

    const desconhecida = await consultarTarefa(arquivos, "E9-T99");
    expect(desconhecida.ok).toBe(false);
    expect(arquivos.gravacoes).toEqual([]);
  });
});

describe("gerar STATUS", () => {
  it("grava uma vez e é idempotente na segunda execução", async () => {
    const arquivos = new ArquivosFalsos(planoTexto(), "", "# STATUS\n\nTexto à mão.\n");

    const primeira = await executarStatus(arquivos);
    expect(primeira).toEqual({ ok: true, alterado: true });
    expect(arquivos.gravacoes).toEqual(["status"]);
    expect(arquivos.status).toContain("Texto à mão.");
    expect(arquivos.status).toContain(MARCADOR_INICIO);

    const segunda = await executarStatus(arquivos);
    expect(segunda).toEqual({ ok: true, alterado: false });
    expect(arquivos.gravacoes).toEqual(["status"]);
  });

  it("não grava nada quando falta o plano", async () => {
    const arquivos = new ArquivosFalsos(null, "", "# STATUS\n");

    const resultado = await executarStatus(arquivos);

    expect(resultado.ok).toBe(false);
    expect(arquivos.gravacoes).toEqual([]);
  });
});
