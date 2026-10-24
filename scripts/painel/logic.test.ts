import { describe, expect, it } from "vitest";
import type { Estado, Evento, Plano, Tarefa } from "./types";
import {
  aplicarTransicao,
  atualizarStatusMarkdown,
  contagemPorEstado,
  formatarConfirmacao,
  formatarPainel,
  formatarStatus,
  historicoTarefa,
  transicaoValida,
  validarTransicao,
} from "./logic";

const baseTarefa = (overrides: Partial<Tarefa>): Tarefa => ({
  id: "T-1",
  etapa: "E0",
  titulo: "tarefa",
  papel: "D",
  estado: "a_fazer",
  ...overrides,
});

const basePlano = (tarefas: Tarefa[]): Plano => ({
  versao: 1,
  etapas: [{ id: "E0", titulo: "Fundação" }],
  tarefas,
});

const evento = (overrides: Partial<Evento>): Evento => ({
  ts: "2026-01-01T00:00:00.000Z",
  tarefa: "T-1",
  de: "a_fazer",
  para: "em_andamento",
  por: "Dev",
  ...overrides,
});

describe("transições", () => {
  it("permite a_fazer → em_andamento", () => {
    const t = baseTarefa({ estado: "a_fazer" });
    expect(transicaoValida(t, "em_andamento", [], undefined)).toEqual({ ok: true });
  });

  it("permite em_andamento → em_revisao", () => {
    const t = baseTarefa({ estado: "em_andamento" });
    expect(transicaoValida(t, "em_revisao", [], undefined)).toEqual({ ok: true });
  });

  it("permite em_revisao → em_qa", () => {
    const t = baseTarefa({ estado: "em_revisao" });
    expect(transicaoValida(t, "em_qa", [], undefined)).toEqual({ ok: true });
  });

  it("permite em_qa → aguardando_rodrigo", () => {
    const t = baseTarefa({ estado: "em_qa" });
    expect(transicaoValida(t, "aguardando_rodrigo", [], undefined)).toEqual({ ok: true });
  });

  it("permite aguardando_rodrigo → concluida", () => {
    const t = baseTarefa({ estado: "aguardando_rodrigo" });
    expect(transicaoValida(t, "concluida", [], undefined)).toEqual({ ok: true });
  });

  it("recusa transições inválidas", () => {
    const t = baseTarefa({ estado: "a_fazer" });
    const result = transicaoValida(t, "concluida", [], undefined);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.erro).toContain("inválida");
    }
  });

  it("recusa alterar tarefa concluida", () => {
    const t = baseTarefa({ estado: "concluida" });
    const result = transicaoValida(t, "em_andamento", [], undefined);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.erro).toContain("concluída");
    }
  });

  it("exige nota para em_revisao → em_andamento", () => {
    const t = baseTarefa({ estado: "em_revisao" });
    expect(transicaoValida(t, "em_andamento", [], undefined).ok).toBe(false);
    expect(transicaoValida(t, "em_andamento", [], "corrija").ok).toBe(true);
  });

  it("exige nota para em_qa → em_andamento", () => {
    const t = baseTarefa({ estado: "em_qa" });
    expect(transicaoValida(t, "em_andamento", [], undefined).ok).toBe(false);
    expect(transicaoValida(t, "em_andamento", [], "devolvido").ok).toBe(true);
  });

  it("exige nota para aguardando_rodrigo → em_andamento", () => {
    const t = baseTarefa({ estado: "aguardando_rodrigo" });
    expect(transicaoValida(t, "em_andamento", [], undefined).ok).toBe(false);
    expect(transicaoValida(t, "em_andamento", [], "precisa revisar").ok).toBe(true);
  });

  it("exige nota para bloquear", () => {
    const t = baseTarefa({ estado: "em_andamento" });
    expect(transicaoValida(t, "bloqueada", [], undefined).ok).toBe(false);
    expect(transicaoValida(t, "bloqueada", [], "impedimento").ok).toBe(true);
  });

  it("permite bloquear de qualquer estado exceto concluida", () => {
    const estados: Estado[] = [
      "a_fazer",
      "em_andamento",
      "em_revisao",
      "em_qa",
      "aguardando_rodrigo",
    ];
    for (const estado of estados) {
      const t = baseTarefa({ estado });
      expect(transicaoValida(t, "bloqueada", [], "x").ok).toBe(true);
    }
  });

  it("volta da bloqueada para o estado anterior do último bloqueio", () => {
    const eventos: Evento[] = [
      evento({ tarefa: "T-1", de: "em_andamento", para: "bloqueada" }),
    ];
    const t = baseTarefa({ estado: "bloqueada" });
    expect(transicaoValida(t, "em_andamento", eventos, undefined).ok).toBe(true);
    expect(transicaoValida(t, "a_fazer", eventos, undefined).ok).toBe(false);
  });

  it("rejeita desbloqueio sem histórico", () => {
    const t = baseTarefa({ estado: "bloqueada" });
    const result = transicaoValida(t, "em_andamento", [], undefined);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.erro).toContain("sem histórico");
    }
  });
});

describe("regra de uma tarefa D em andamento por etapa", () => {
  it("permite iniciar quando não há outra D em_andamento", () => {
    const plano = basePlano([
      baseTarefa({ id: "E0-T01", estado: "a_fazer" }),
      baseTarefa({ id: "E0-T02", estado: "concluida" }),
    ]);
    const result = validarTransicao(plano, "E0-T01", "em_andamento", [], "Dev", undefined);
    expect("erro" in result).toBe(false);
  });

  it("recusa iniciar segunda D em_andamento na mesma etapa", () => {
    const plano = basePlano([
      baseTarefa({ id: "E0-T01", estado: "em_andamento" }),
      baseTarefa({ id: "E0-T02", estado: "a_fazer" }),
    ]);
    const result = validarTransicao(plano, "E0-T02", "em_andamento", [], "Dev", undefined);
    expect("erro" in result).toBe(true);
    if ("erro" in result) {
      expect(result.erro).toContain("E0-T01");
      expect(result.erro).toContain("só 1 tarefa D por etapa");
    }
  });

  it("permite E0-T00 e E0-T05 em_andamento juntas", () => {
    const plano = basePlano([
      baseTarefa({ id: "E0-T00", estado: "em_andamento" }),
      baseTarefa({ id: "E0-T05", estado: "a_fazer" }),
    ]);
    const result = validarTransicao(plano, "E0-T05", "em_andamento", [], "Dev", undefined);
    expect("erro" in result).toBe(false);
  });

  it("recusa terceira D em_andamento mesmo com E0-T00 presente", () => {
    const plano = basePlano([
      baseTarefa({ id: "E0-T00", estado: "em_andamento" }),
      baseTarefa({ id: "E0-T05", estado: "em_andamento" }),
      baseTarefa({ id: "E0-T06", estado: "a_fazer" }),
    ]);
    const result = validarTransicao(plano, "E0-T06", "em_andamento", [], "Dev", undefined);
    expect("erro" in result).toBe(true);
  });
});

describe("validarTransicao", () => {
  it("recusa ID inexistente", () => {
    const plano = basePlano([baseTarefa({})]);
    const result = validarTransicao(plano, "X", "em_andamento", [], "Dev", undefined);
    expect("erro" in result).toBe(true);
  });

  it("recusa estado inválido", () => {
    const plano = basePlano([baseTarefa({})]);
    const result = validarTransicao(plano, "T-1", "invalido" as Estado, [], "Dev", undefined);
    expect("erro" in result).toBe(true);
  });

  it("recusa pessoa inválida", () => {
    const plano = basePlano([baseTarefa({})]);
    const result = validarTransicao(plano, "T-1", "em_andamento", [], "Cliente" as never, undefined);
    expect("erro" in result).toBe(true);
  });

  it("produz evento e tarefa atualizada", () => {
    const plano = basePlano([baseTarefa({ estado: "a_fazer" })]);
    const result = validarTransicao(plano, "T-1", "em_andamento", [], "Dev", undefined);
    expect("erro" in result).toBe(false);
    if (!("erro" in result)) {
      expect(result.tarefa.estado).toBe("em_andamento");
      expect(result.evento.de).toBe("a_fazer");
      expect(result.evento.para).toBe("em_andamento");
      expect(result.evento.por).toBe("Dev");
    }
  });
});

describe("aplicarTransicao", () => {
  it("atualiza apenas a tarefa correta", () => {
    const plano = basePlano([
      baseTarefa({ id: "T-1", estado: "a_fazer" }),
      baseTarefa({ id: "T-2", estado: "a_fazer" }),
    ]);
    const atualizada = baseTarefa({ id: "T-1", estado: "em_andamento" });
    const novo = aplicarTransicao(plano, atualizada);
    expect(novo.tarefas[0]?.estado).toBe("em_andamento");
    expect(novo.tarefas[1]?.estado).toBe("a_fazer");
  });
});

describe("histórico", () => {
  it("filtra eventos da tarefa", () => {
    const eventos: Evento[] = [
      evento({ tarefa: "T-1", de: "a_fazer", para: "em_andamento" }),
      evento({ tarefa: "T-2", de: "a_fazer", para: "em_andamento" }),
    ];
    expect(historicoTarefa(eventos, "T-1")).toHaveLength(1);
  });
});

describe("formatação", () => {
  it("conta estados corretamente", () => {
    const tarefas: Tarefa[] = [
      baseTarefa({ estado: "a_fazer" }),
      baseTarefa({ estado: "em_andamento" }),
      baseTarefa({ estado: "em_andamento" }),
    ];
    expect(contagemPorEstado(tarefas)).toEqual({
      a_fazer: 1,
      em_andamento: 2,
      em_revisao: 0,
      em_qa: 0,
      aguardando_rodrigo: 0,
      concluida: 0,
      bloqueada: 0,
    });
  });

  it("formata confirmação", () => {
    const e = evento({ tarefa: "E0-T04", de: "em_qa", para: "aguardando_rodrigo", por: "QA" });
    expect(formatarConfirmacao(e)).toBe("E0-T04: em_qa → aguardando_rodrigo (QA)");
  });

  it("painel inclui etapas e tarefas ativas", () => {
    const plano = basePlano([baseTarefa({ id: "E0-T00", estado: "em_andamento" })]);
    const painel = formatarPainel(plano, new Date("2026-01-01T00:00:00.000Z"));
    expect(painel).toContain("E0 — Fundação");
    expect(painel).toContain("[em_andamento] E0-T00");
  });

  it("status gera markdown com marcadores", () => {
    const plano = basePlano([baseTarefa({ id: "E0-T00", estado: "em_andamento" })]);
    const status = formatarStatus(plano);
    expect(status).toContain("<!-- painel:inicio -->");
    expect(status).toContain("<!-- painel:fim -->");
    expect(status).toContain("| E0 — Fundação |");
  });
});

describe("atualizarStatusMarkdown", () => {
  it("acrescenta bloco no final quando marcadores não existem", () => {
    const atual = "# STATUS\n\nTexto manual.\n";
    const bloco = "<!-- painel:inicio -->\nbloco\n<!-- painel:fim -->\n";
    const novo = atualizarStatusMarkdown(atual, bloco);
    expect(novo).toContain("Texto manual.");
    expect(novo).toContain("<!-- painel:inicio -->");
    expect(novo.indexOf("Texto manual.")).toBeLessThan(novo.indexOf("<!-- painel:inicio -->"));
  });

  it("substitui apenas o trecho entre marcadores", () => {
    const atual = "# STATUS\n\n<!-- painel:inicio -->\nantigo\n<!-- painel:fim -->\n\nRodapé.\n";
    const bloco = "<!-- painel:inicio -->\nnovo\n<!-- painel:fim -->\n";
    const novo = atualizarStatusMarkdown(atual, bloco);
    expect(novo).toContain("novo");
    expect(novo).not.toContain("antigo");
    expect(novo).toContain("Rodapé.");
  });

  it("é idempotente quando o bloco não muda", () => {
    const atual = "# STATUS\n\n<!-- painel:inicio -->\nantigo\n<!-- painel:fim -->\n";
    const bloco = "<!-- painel:inicio -->\nnovo\n<!-- painel:fim -->\n";
    const primeiro = atualizarStatusMarkdown(atual, bloco);
    const segundo = atualizarStatusMarkdown(primeiro, bloco);
    expect(segundo).toBe(primeiro);
  });
});

describe("erro sem efeito colateral", () => {
  it("validarTransicao não altera o plano", () => {
    const plano = basePlano([baseTarefa({ estado: "a_fazer" })]);
    validarTransicao(plano, "T-1", "concluida", [], "Dev", undefined);
    expect(plano.tarefas[0]?.estado).toBe("a_fazer");
  });
});
