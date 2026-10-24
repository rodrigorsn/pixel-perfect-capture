export const ESTADOS = [
  "a_fazer",
  "em_andamento",
  "em_revisao",
  "em_qa",
  "aguardando_rodrigo",
  "concluida",
  "bloqueada",
] as const;

export type Estado = (typeof ESTADOS)[number];

export const PAPEIS_MUDANCA = ["Maestro", "Dev", "Revisor", "Segunda", "QA", "Rodrigo"] as const;

export type PapelMudanca = (typeof PAPEIS_MUDANCA)[number];

export const PAPEIS_TAREFA = ["D", "R", "Q", "M", "P"] as const;

export type PapelTarefa = (typeof PAPEIS_TAREFA)[number];

export interface Etapa {
  id: string;
  titulo: string;
}

export interface Tarefa {
  id: string;
  etapa: string;
  titulo: string;
  papel: PapelTarefa;
  estado: Estado;
}

export interface Plano {
  versao: number;
  etapas: Etapa[];
  tarefas: Tarefa[];
}

export interface Evento {
  ts: string;
  tarefa: string;
  de: Estado;
  para: Estado;
  por: PapelMudanca;
  nota?: string;
}

export const TRANSICOES: Record<Estado, readonly Estado[]> = {
  a_fazer: ["em_andamento"],
  em_andamento: ["em_revisao"],
  em_revisao: ["em_qa", "em_andamento"],
  em_qa: ["aguardando_rodrigo", "em_andamento"],
  aguardando_rodrigo: ["concluida", "em_andamento"],
  concluida: [],
  bloqueada: [],
};

export const EXCECAO_DEV_SIMULTANEO = "E0-T05";

export function ehEstado(valor: string): valor is Estado {
  return (ESTADOS as readonly string[]).includes(valor);
}

export function ehPapelMudanca(valor: string): valor is PapelMudanca {
  return (PAPEIS_MUDANCA as readonly string[]).includes(valor);
}

export function ehPapelTarefa(valor: string): valor is PapelTarefa {
  return (PAPEIS_TAREFA as readonly string[]).includes(valor);
}

export function exigeNota(de: Estado, para: Estado): boolean {
  if (para === "bloqueada") return true;
  if (para !== "em_andamento") return false;
  return de === "em_revisao" || de === "em_qa" || de === "aguardando_rodrigo";
}
