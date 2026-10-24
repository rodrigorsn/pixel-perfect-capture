import {
  ESTADOS,
  EXCECAO_DEV_SIMULTANEO,
  PAPEIS_MUDANCA,
  TRANSICOES,
  ehPapelMudanca,
  ehPapelTarefa,
  ehEstado,
  exigeNota,
  type Estado,
  type Etapa,
  type Evento,
  type Plano,
  type Tarefa,
} from "./modelo.ts";

export interface SolicitacaoMudanca {
  id: string;
  para: string;
  por: string;
  nota?: string;
}

export type ResultadoMudanca =
  { ok: true; plano: Plano; evento: Evento; de: Estado } | { ok: false; erro: string };

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function exigirTexto(valor: unknown, campo: string): string {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new Error(`plano.json inválido: ${campo} deve ser texto não vazio.`);
  }
  return valor;
}

export function validarPlano(valor: unknown): Plano {
  if (!ehObjeto(valor)) {
    throw new Error("plano.json inválido: esperado um objeto.");
  }

  const versao = valor["versao"];
  if (typeof versao !== "number") {
    throw new Error("plano.json inválido: versao deve ser número.");
  }

  const etapasBrutas = valor["etapas"];
  if (!Array.isArray(etapasBrutas)) {
    throw new Error("plano.json inválido: etapas deve ser uma lista.");
  }

  const tarefasBrutas = valor["tarefas"];
  if (!Array.isArray(tarefasBrutas)) {
    throw new Error("plano.json inválido: tarefas deve ser uma lista.");
  }

  const etapas: Etapa[] = [];
  const idsEtapas = new Set<string>();

  for (const [indice, item] of etapasBrutas.entries()) {
    if (!ehObjeto(item)) {
      throw new Error(`plano.json inválido: etapas[${indice}] deve ser um objeto.`);
    }
    const id = exigirTexto(item["id"], `etapas[${indice}].id`);
    const titulo = exigirTexto(item["titulo"], `etapas[${indice}].titulo`);
    if (idsEtapas.has(id)) {
      throw new Error(`plano.json inválido: etapa duplicada ${id}.`);
    }
    idsEtapas.add(id);
    etapas.push({ id, titulo });
  }

  const tarefas: Tarefa[] = [];
  const idsTarefas = new Set<string>();

  for (const [indice, item] of tarefasBrutas.entries()) {
    if (!ehObjeto(item)) {
      throw new Error(`plano.json inválido: tarefas[${indice}] deve ser um objeto.`);
    }
    const id = exigirTexto(item["id"], `tarefas[${indice}].id`);
    const etapa = exigirTexto(item["etapa"], `tarefas[${indice}].etapa`);
    const titulo = exigirTexto(item["titulo"], `tarefas[${indice}].titulo`);
    const papel = exigirTexto(item["papel"], `tarefas[${indice}].papel`);
    const estado = exigirTexto(item["estado"], `tarefas[${indice}].estado`);
    const antesDoBloqueio = item["antesDoBloqueio"];

    if (idsTarefas.has(id)) {
      throw new Error(`plano.json inválido: tarefa duplicada ${id}.`);
    }
    idsTarefas.add(id);

    if (!idsEtapas.has(etapa)) {
      throw new Error(`plano.json inválido: tarefa ${id} aponta para etapa inexistente ${etapa}.`);
    }
    if (!ehPapelTarefa(papel)) {
      throw new Error(`plano.json inválido: papel inválido em ${id}: ${papel}.`);
    }
    if (!ehEstado(estado)) {
      throw new Error(`plano.json inválido: estado inválido em ${id}: ${estado}.`);
    }
    if (antesDoBloqueio !== undefined) {
      if (typeof antesDoBloqueio !== "string" || !ehEstado(antesDoBloqueio)) {
        throw new Error(`plano.json inválido: antesDoBloqueio inválido em ${id}.`);
      }
      if (antesDoBloqueio === "bloqueada" || antesDoBloqueio === "concluida") {
        throw new Error(
          `plano.json inválido: antesDoBloqueio inválido em ${id}: ${antesDoBloqueio}.`,
        );
      }
      if (estado !== "bloqueada") {
        throw new Error(
          `plano.json inválido: antesDoBloqueio só pode existir em tarefa bloqueada (${id}).`,
        );
      }
    }

    const tarefa: Tarefa = { id, etapa, titulo, papel, estado };
    if (antesDoBloqueio !== undefined) tarefa.antesDoBloqueio = antesDoBloqueio;
    tarefas.push(tarefa);
  }

  return { versao, etapas, tarefas };
}

export function analisarPlano(texto: string): Plano {
  let valor: unknown;
  try {
    valor = JSON.parse(texto);
  } catch {
    throw new Error("plano.json inválido: JSON malformado.");
  }
  return validarPlano(valor);
}

export function serializarPlano(plano: Plano): string {
  return `${JSON.stringify(plano, null, 2)}\n`;
}

export function analisarEventos(texto: string): Evento[] {
  const eventos: Evento[] = [];
  const linhas = texto.split(/\r?\n/);

  linhas.forEach((linha, indice) => {
    if (linha.trim() === "") return;

    let valor: unknown;
    try {
      valor = JSON.parse(linha);
    } catch {
      throw new Error(`eventos.jsonl inválido na linha ${indice + 1}: JSON malformado.`);
    }

    if (!ehObjeto(valor)) {
      throw new Error(`eventos.jsonl inválido na linha ${indice + 1}: esperado um objeto.`);
    }

    const ts = valor["ts"];
    const tarefa = valor["tarefa"];
    const de = valor["de"];
    const para = valor["para"];
    const por = valor["por"];
    const nota = valor["nota"];

    if (typeof ts !== "string" || typeof tarefa !== "string") {
      throw new Error(
        `eventos.jsonl inválido na linha ${indice + 1}: ts e tarefa são obrigatórios.`,
      );
    }
    if (typeof de !== "string" || !ehEstado(de)) {
      throw new Error(`eventos.jsonl inválido na linha ${indice + 1}: de inválido.`);
    }
    if (typeof para !== "string" || !ehEstado(para)) {
      throw new Error(`eventos.jsonl inválido na linha ${indice + 1}: para inválido.`);
    }
    if (typeof por !== "string" || !ehPapelMudanca(por)) {
      throw new Error(`eventos.jsonl inválido na linha ${indice + 1}: por inválido.`);
    }
    if (nota !== undefined && typeof nota !== "string") {
      throw new Error(`eventos.jsonl inválido na linha ${indice + 1}: nota deve ser texto.`);
    }

    const evento: Evento = { ts, tarefa, de, para, por };
    if (nota !== undefined) evento.nota = nota;
    eventos.push(evento);
  });

  return eventos;
}

export function mudarTarefa(
  plano: Plano,
  solicitacao: SolicitacaoMudanca,
  agora: Date,
): ResultadoMudanca {
  const tarefa = plano.tarefas.find((item) => item.id === solicitacao.id);
  if (tarefa === undefined) {
    return { ok: false, erro: `Tarefa desconhecida: ${solicitacao.id}.` };
  }

  const para = solicitacao.para;
  if (!ehEstado(para)) {
    return { ok: false, erro: `Estado inválido: ${para}. Válidos: ${ESTADOS.join(", ")}.` };
  }

  const por = solicitacao.por;
  if (!ehPapelMudanca(por)) {
    return { ok: false, erro: `--por inválido: ${por}. Use: ${PAPEIS_MUDANCA.join(", ")}.` };
  }

  const de = tarefa.estado;
  if (de === para) {
    return {
      ok: false,
      erro: `Transição inválida: ${de} → ${para} (a tarefa já está nesse estado).`,
    };
  }
  if (de === "concluida") {
    return {
      ok: false,
      erro: `Transição inválida: concluida → ${para} (tarefa concluída não muda).`,
    };
  }

  const nota = solicitacao.nota?.trim();
  if (exigeNota(de, para) && !nota) {
    return { ok: false, erro: `A transição ${de} → ${para} exige --nota.` };
  }

  if (de === "bloqueada") {
    const anterior = tarefa.antesDoBloqueio;
    if (anterior === undefined) {
      return {
        ok: false,
        erro: `Tarefa bloqueada sem antesDoBloqueio no plano.json; não é possível restaurar o estado anterior.`,
      };
    }
    if (para !== anterior) {
      return {
        ok: false,
        erro: `Transição inválida: bloqueada → ${para}. O bloqueio anterior veio de ${anterior}; a tarefa só volta para ${anterior}.`,
      };
    }
  } else if (para !== "bloqueada" && !TRANSICOES[de].includes(para)) {
    return {
      ok: false,
      erro: `Transição inválida: ${de} → ${para}. Válidas a partir de ${de}: ${TRANSICOES[de].join(", ") || "nenhuma"}.`,
    };
  }

  if (para === "em_andamento" && tarefa.papel === "D" && tarefa.id !== EXCECAO_DEV_SIMULTANEO) {
    const emAndamento = plano.tarefas.find(
      (item) =>
        item.id !== tarefa.id &&
        item.id !== EXCECAO_DEV_SIMULTANEO &&
        item.etapa === tarefa.etapa &&
        item.papel === "D" &&
        item.estado === "em_andamento",
    );
    if (emAndamento !== undefined) {
      return {
        ok: false,
        erro: `Limite de 1 tarefa D em andamento na etapa ${tarefa.etapa}: ${emAndamento.id} já está em em_andamento.`,
      };
    }
  }

  const base = { ts: agora.toISOString(), tarefa: tarefa.id, de, para, por };
  const evento: Evento = nota ? { ...base, nota } : base;

  const atualizada: Tarefa = { ...tarefa, estado: para };
  if (para === "bloqueada") {
    atualizada.antesDoBloqueio = de;
  } else if (de === "bloqueada") {
    delete atualizada.antesDoBloqueio;
  }

  const novoPlano: Plano = {
    ...plano,
    tarefas: plano.tarefas.map((item) => (item.id === tarefa.id ? atualizada : item)),
  };

  return { ok: true, plano: novoPlano, evento, de };
}
