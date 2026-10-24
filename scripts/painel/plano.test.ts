import { describe, expect, it } from "vitest";
import type { Estado, Evento, Plano, Tarefa } from "./modelo.ts";
import { analisarEventos, analisarPlano, mudarTarefa } from "./plano.ts";

const agora = new Date("2026-10-24T12:00:00.000Z");

function planoCom(estado: Estado, papel: "D" | "R" = "R"): Plano {
  return {
    versao: 1,
    etapas: [{ id: "E9", titulo: "Teste" }],
    tarefas: [{ id: "E9-T01", etapa: "E9", titulo: "Tarefa", papel, estado }],
  };
}

function planoE0(tarefas: Tarefa[]): Plano {
  return {
    versao: 1,
    etapas: [
      { id: "E0", titulo: "Fundação" },
      { id: "E1", titulo: "Rede" },
    ],
    tarefas,
  };
}

function tarefa(id: string, etapa: string, papel: "D" | "P", estado: Estado): Tarefa {
  return { id, etapa, titulo: id, papel, estado };
}

function evento(de: Estado, para: Estado): Evento {
  return { ts: "2026-10-24T11:00:00.000Z", tarefa: "E9-T01", de, para, por: "Maestro" };
}

describe("transições de tarefa", () => {
  const validas: Array<[Estado, Estado, boolean]> = [
    ["a_fazer", "em_andamento", false],
    ["em_andamento", "em_revisao", false],
    ["em_revisao", "em_qa", false],
    ["em_revisao", "em_andamento", true],
    ["em_qa", "aguardando_rodrigo", false],
    ["em_qa", "em_andamento", true],
    ["aguardando_rodrigo", "concluida", false],
    ["aguardando_rodrigo", "em_andamento", true],
  ];

  it("aceita todas as transições previstas", () => {
    for (const [de, para, comNota] of validas) {
      const resultado = mudarTarefa(
        planoCom(de),
        [],
        {
          id: "E9-T01",
          para,
          por: "Dev",
          ...(comNota ? { nota: "ajuste solicitado" } : {}),
        },
        agora,
      );
      expect(resultado.ok, `${de} → ${para}`).toBe(true);
    }
  });

  const invalidas: Array<[Estado, Estado]> = [
    ["a_fazer", "em_qa"],
    ["a_fazer", "concluida"],
    ["em_andamento", "concluida"],
    ["em_revisao", "aguardando_rodrigo"],
    ["em_qa", "em_revisao"],
    ["aguardando_rodrigo", "em_qa"],
    ["concluida", "em_andamento"],
    ["concluida", "bloqueada"],
  ];

  it("recusa transições fora da tabela", () => {
    for (const [de, para] of invalidas) {
      const resultado = mudarTarefa(
        planoCom(de),
        [],
        { id: "E9-T01", para, por: "Dev", nota: "tentativa" },
        agora,
      );
      expect(resultado.ok, `${de} → ${para}`).toBe(false);
      if (!resultado.ok) expect(resultado.erro).toMatch(/inválida/i);
    }
  });

  it("exige nota para pedir mudanças, devolver e bloquear", () => {
    const comNota: Array<[Estado, Estado]> = [
      ["em_revisao", "em_andamento"],
      ["em_qa", "em_andamento"],
      ["aguardando_rodrigo", "em_andamento"],
      ["a_fazer", "bloqueada"],
    ];

    for (const [de, para] of comNota) {
      for (const nota of [undefined, "   "]) {
        const resultado = mudarTarefa(
          planoCom(de),
          [],
          { id: "E9-T01", para, por: "Dev", ...(nota === undefined ? {} : { nota }) },
          agora,
        );
        expect(resultado.ok, `${de} → ${para} sem nota`).toBe(false);
        if (!resultado.ok) expect(resultado.erro).toContain("--nota");
      }
    }
  });

  it("aceita nota opcional e grava o evento em UTC", () => {
    const resultado = mudarTarefa(
      planoCom("em_revisao"),
      [],
      { id: "E9-T01", para: "em_andamento", por: "Revisor", nota: "  ajustar testes  " },
      agora,
    );

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.evento.ts).toBe("2026-10-24T12:00:00.000Z");
    expect(resultado.evento.nota).toBe("ajustar testes");
  });

  it("não altera o plano original", () => {
    const plano = planoCom("em_andamento");
    const antes = JSON.stringify(plano);
    const resultado = mudarTarefa(plano, [], { id: "E9-T01", para: "em_revisao", por: "Dev" }, agora);

    expect(resultado.ok).toBe(true);
    expect(JSON.stringify(plano)).toBe(antes);
  });

  it("recusa ID, estado e papel desconhecidos", () => {
    const desconhecida = mudarTarefa(planoCom("a_fazer"), [], { id: "X", para: "em_andamento", por: "Dev" }, agora);
    expect(desconhecida.ok).toBe(false);
    if (!desconhecida.ok) expect(desconhecida.erro).toContain("Tarefa desconhecida");

    const estadoRuim = mudarTarefa(planoCom("a_fazer"), [], { id: "E9-T01", para: "pronto", por: "Dev" }, agora);
    expect(estadoRuim.ok).toBe(false);
    if (!estadoRuim.ok) expect(estadoRuim.erro).toContain("Estado inválido");

    const papelRuim = mudarTarefa(planoCom("a_fazer"), [], { id: "E9-T01", para: "em_andamento", por: "dev" }, agora);
    expect(papelRuim.ok).toBe(false);
    if (!papelRuim.ok) expect(papelRuim.erro).toContain("--por inválido");
  });
});

describe("bloqueio", () => {
  it("volta ao estado anterior lido do último evento de bloqueio", () => {
    const bloqueio = mudarTarefa(
      planoCom("em_qa"),
      [],
      { id: "E9-T01", para: "bloqueada", por: "Maestro", nota: "aguardando decisão" },
      agora,
    );
    expect(bloqueio.ok).toBe(true);
    if (!bloqueio.ok) return;
    expect(bloqueio.plano.tarefas[0]?.estado).toBe("bloqueada");

    const volta = mudarTarefa(
      bloqueio.plano,
      [bloqueio.evento],
      { id: "E9-T01", para: "em_qa", por: "Maestro" },
      agora,
    );
    expect(volta.ok).toBe(true);
    if (!volta.ok) return;
    expect(volta.de).toBe("bloqueada");
    expect(volta.plano.tarefas[0]?.estado).toBe("em_qa");
  });

  it("recusa destino diferente do estado anterior", () => {
    const bloqueio = mudarTarefa(
      planoCom("em_qa"),
      [],
      { id: "E9-T01", para: "bloqueada", por: "Maestro", nota: "bloqueado" },
      agora,
    );
    expect(bloqueio.ok).toBe(true);
    if (!bloqueio.ok) return;

    const errada = mudarTarefa(
      bloqueio.plano,
      [bloqueio.evento],
      { id: "E9-T01", para: "em_andamento", por: "Dev" },
      agora,
    );
    expect(errada.ok).toBe(false);
    if (!errada.ok) expect(errada.erro).toContain("em_qa");
  });

  it("recusa desbloqueio sem evento ou com log inconsistente", () => {
    const semLog = mudarTarefa(planoCom("bloqueada"), [], { id: "E9-T01", para: "a_fazer", por: "Maestro" }, agora);
    expect(semLog.ok).toBe(false);
    if (!semLog.ok) expect(semLog.erro).toContain("sem evento de bloqueio");

    const inconsistente: Evento = {
      ts: "2026-10-24T11:00:00.000Z",
      tarefa: "E9-T01",
      de: "concluida",
      para: "bloqueada",
      por: "Maestro",
    };
    const resultado = mudarTarefa(
      planoCom("bloqueada"),
      [inconsistente],
      { id: "E9-T01", para: "concluida", por: "Maestro" },
      agora,
    );
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.erro).toContain("Log inconsistente");
  });

  it("permite bloquear a partir de qualquer estado não concluído", () => {
    for (const estado of ["a_fazer", "em_andamento", "em_revisao", "em_qa", "aguardando_rodrigo"] as const) {
      const resultado = mudarTarefa(
        planoCom(estado),
        [],
        { id: "E9-T01", para: "bloqueada", por: "Maestro", nota: "impedimento" },
        agora,
      );
      expect(resultado.ok, estado).toBe(true);
    }
  });
});

describe("limite de uma tarefa D em andamento", () => {
  it("recusa a segunda tarefa D na mesma etapa", () => {
    const plano = planoE0([
      tarefa("E0-T00", "E0", "D", "em_andamento"),
      tarefa("E0-T09", "E0", "D", "a_fazer"),
      tarefa("E1-T01", "E1", "D", "a_fazer"),
      tarefa("E1-T02", "E1", "D", "a_fazer"),
    ]);

    const primeiro = mudarTarefa(plano, [], { id: "E1-T01", para: "em_andamento", por: "Dev" }, agora);
    expect(primeiro.ok).toBe(true);
    if (!primeiro.ok) return;

    const segundo = mudarTarefa(
      primeiro.plano,
      [primeiro.evento],
      { id: "E1-T02", para: "em_andamento", por: "Dev" },
      agora,
    );
    expect(segundo.ok).toBe(false);
    if (!segundo.ok) expect(segundo.erro).toContain("E1-T01");
  });

  it("não conta etapas diferentes", () => {
    const plano = planoE0([
      tarefa("E0-T00", "E0", "D", "em_andamento"),
      tarefa("E1-T01", "E1", "D", "a_fazer"),
    ]);

    const resultado = mudarTarefa(plano, [], { id: "E1-T01", para: "em_andamento", por: "Dev" }, agora);
    expect(resultado.ok).toBe(true);
  });

  it("isenta a E0-T05, que roda junto com a E0-T00", () => {
    const plano = planoE0([
      tarefa("E0-T00", "E0", "D", "em_andamento"),
      tarefa("E0-T05", "E0", "D", "a_fazer"),
      tarefa("E0-T09", "E0", "D", "a_fazer"),
    ]);

    const teste = mudarTarefa(plano, [], { id: "E0-T05", para: "em_andamento", por: "Dev" }, agora);
    expect(teste.ok).toBe(true);

    const outro = mudarTarefa(plano, [], { id: "E0-T09", para: "em_andamento", por: "Dev" }, agora);
    expect(outro.ok).toBe(false);
    if (!outro.ok) expect(outro.erro).toContain("E0-T00");
  });
});

describe("leitura do plano e do log", () => {
  it("aceita um plano válido", () => {
    const plano = analisarPlano(JSON.stringify(planoCom("a_fazer", "D")));
    expect(plano.tarefas).toHaveLength(1);
    expect(plano.tarefas[0]?.estado).toBe("a_fazer");
  });

  it("recusa JSON malformado e estruturas inválidas", () => {
    expect(() => analisarPlano("{")).toThrow(/JSON/);

    const base = planoCom("a_fazer");
    const duplicada = { id: "E9-T01", etapa: "E9", titulo: "Duplicada", papel: "D", estado: "a_fazer" };
    expect(() => analisarPlano(JSON.stringify({ ...base, tarefas: [...base.tarefas, duplicada] }))).toThrow(
      /duplicada/,
    );

    const orfa = { id: "E9-T02", etapa: "E8", titulo: "Órfã", papel: "D", estado: "a_fazer" };
    expect(() => analisarPlano(JSON.stringify({ ...base, tarefas: [orfa] }))).toThrow(/inexistente/);

    const estadoRuim = { id: "E9-T02", etapa: "E9", titulo: "Ruim", papel: "D", estado: "pronto" };
    expect(() => analisarPlano(JSON.stringify({ ...base, tarefas: [estadoRuim] }))).toThrow(/estado inválido/);

    const papelRuim = { id: "E9-T02", etapa: "E9", titulo: "Ruim", papel: "X", estado: "a_fazer" };
    expect(() => analisarPlano(JSON.stringify({ ...base, tarefas: [papelRuim] }))).toThrow(/papel inválido/);
  });

  it("lê o log JSONL ignorando linhas vazias", () => {
    const texto = `${JSON.stringify(evento("a_fazer", "em_andamento"))}\r\n\r\n`;
    const eventos = analisarEventos(texto);
    expect(eventos).toHaveLength(1);
    expect(eventos[0]?.para).toBe("em_andamento");
  });

  it("recusa linha malformada no log", () => {
    expect(() => analisarEventos("{")).toThrow(/linha 1/);
  });
});
