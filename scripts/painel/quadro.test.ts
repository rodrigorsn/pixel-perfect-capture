import { describe, expect, it } from "vitest";
import type { Plano } from "./modelo.ts";
import {
  MARCADOR_FIM,
  MARCADOR_INICIO,
  atualizarBlocoStatus,
  renderizarPainel,
  renderizarQuadroMarkdown,
  renderizarTarefa,
} from "./quadro.ts";

function planoDeTeste(): Plano {
  return {
    versao: 1,
    etapas: [
      { id: "E0", titulo: "Fundação" },
      { id: "E1", titulo: "Rede" },
      { id: "E2", titulo: "Fluxo" },
    ],
    tarefas: [
      { id: "E0-T00", etapa: "E0", titulo: "Painel", papel: "D", estado: "em_andamento" },
      { id: "E0-T04", etapa: "E0", titulo: "CI", papel: "D", estado: "em_qa" },
      { id: "E0-T05", etapa: "E0", titulo: "Teste de modelos", papel: "D", estado: "em_andamento" },
      { id: "E1-T01", etapa: "E1", titulo: "Calc", papel: "D", estado: "a_fazer" },
    ],
  };
}

describe("painel em texto", () => {
  it("mostra contagem por estado e as tarefas ativas", () => {
    const texto = renderizarPainel(planoDeTeste());

    expect(texto).toContain("E0 — Fundação — 3 tarefas");
    expect(texto).toContain("a_fazer 0 · em_andamento 2 · em_revisao 0 · em_qa 1");
    expect(texto).toContain("em_andamento: E0-T00, E0-T05");
    expect(texto).toContain("em_revisao: —");
    expect(texto).toContain("em_qa: E0-T04");
    expect(texto).toContain("E1 — Rede — 1 tarefa");
    expect(texto).toContain("E2 — Fluxo — 0 tarefas");
  });

  it("cabe em 100 colunas", () => {
    const linhas = renderizarPainel(planoDeTeste()).split("\n");
    for (const linha of linhas) {
      expect(linha.length, linha).toBeLessThanOrEqual(100);
    }
  });
});

describe("quadro em Markdown", () => {
  it("gera uma tabela por etapa", () => {
    const markdown = renderizarQuadroMarkdown(planoDeTeste());

    expect(markdown).toContain("### E0 — Fundação");
    expect(markdown).toContain("| Estado | Quantidade | Tarefas |");
    expect(markdown).toContain("| em_andamento | 2 | E0-T00, E0-T05 |");
    expect(markdown).toContain("| em_qa | 1 | E0-T04 |");
    expect(markdown).toContain("### E2 — Fluxo\n\n_Sem tarefas._");
  });
});

describe("bloco gerado no STATUS", () => {
  it("substitui só o trecho entre os marcadores", () => {
    const original = [
      "# STATUS",
      "",
      "Texto escrito à mão.",
      "",
      MARCADOR_INICIO,
      "conteúdo antigo",
      MARCADOR_FIM,
      "",
      "Rodapé escrito à mão.",
      "",
    ].join("\n");

    const atualizado = atualizarBlocoStatus(original, "NOVO QUADRO");

    expect(atualizado).toContain("Texto escrito à mão.");
    expect(atualizado).toContain("Rodapé escrito à mão.");
    expect(atualizado).not.toContain("conteúdo antigo");
    expect(atualizado).toContain(`${MARCADOR_INICIO}\nNOVO QUADRO\n${MARCADOR_FIM}`);
    expect(atualizarBlocoStatus(atualizado, "NOVO QUADRO")).toBe(atualizado);
  });

  it("acrescenta o bloco no final quando os marcadores não existem", () => {
    const original = "# STATUS\n\nTexto à mão.\n";
    const atualizado = atualizarBlocoStatus(original, "QUADRO");

    expect(atualizado.startsWith(original)).toBe(true);
    expect(atualizado).toContain(`${MARCADOR_INICIO}\nQUADRO\n${MARCADOR_FIM}`);
    expect(atualizarBlocoStatus(atualizado, "QUADRO")).toBe(atualizado);
  });

  it("funciona em arquivo vazio", () => {
    const atualizado = atualizarBlocoStatus("", "QUADRO");
    expect(atualizado).toBe(`${MARCADOR_INICIO}\nQUADRO\n${MARCADOR_FIM}\n`);
    expect(atualizarBlocoStatus(atualizado, "QUADRO")).toBe(atualizado);
  });
});

describe("detalhe da tarefa", () => {
  it("mostra a tarefa e o histórico do log", () => {
    const texto = renderizarTarefa(
      planoDeTeste(),
      [
        {
          ts: "2026-10-24T11:00:00.000Z",
          tarefa: "E0-T04",
          de: "em_revisao",
          para: "em_qa",
          por: "Revisor",
          nota: "aprovado",
        },
      ],
      "E0-T04",
    );

    expect(texto).toContain("E0-T04 — CI");
    expect(texto).toContain("estado: em_qa");
    expect(texto).toContain("em_revisao → em_qa (Revisor) — aprovado");
  });

  it("avisa quando não há histórico", () => {
    expect(renderizarTarefa(planoDeTeste(), [], "E0-T00")).toContain("(sem eventos)");
  });

  it("recusa tarefa desconhecida", () => {
    expect(() => renderizarTarefa(planoDeTeste(), [], "E9-T99")).toThrow(/desconhecida/);
  });
});
