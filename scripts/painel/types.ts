export type Estado =
  | "a_fazer"
  | "em_andamento"
  | "em_revisao"
  | "em_qa"
  | "aguardando_rodrigo"
  | "concluida"
  | "bloqueada";

export type Papel = "D" | "R" | "Q" | "M" | "P";

export interface Etapa {
  id: string;
  titulo: string;
}

export interface Tarefa {
  id: string;
  etapa: string;
  titulo: string;
  papel: Papel;
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
  por: string;
  nota?: string;
}

export const ESTADOS: Estado[] = [
  "a_fazer",
  "em_andamento",
  "em_revisao",
  "em_qa",
  "aguardando_rodrigo",
  "concluida",
  "bloqueada",
];

export const PAPARES_VALIDOS: Papel[] = ["D", "R", "Q", "M", "P"];

export const PESSOAS_VALIDAS = ["Maestro", "Dev", "Revisor", "Segunda", "QA", "Rodrigo"] as const;
export type Pessoa = (typeof PESSOAS_VALIDAS)[number];
