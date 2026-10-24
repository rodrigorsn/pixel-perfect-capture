import { ESTADOS, type Evento, type Plano, type Tarefa } from "./modelo.ts";

const LARGURA = 100;

const ESTADOS_ATIVOS = [
  "em_andamento",
  "em_revisao",
  "em_qa",
  "aguardando_rodrigo",
  "bloqueada",
] as const;

function tarefasDaEtapa(plano: Plano, etapaId: string): Tarefa[] {
  return plano.tarefas.filter((tarefa) => tarefa.etapa === etapaId);
}

function contagens(tarefas: Tarefa[]): string[] {
  const partes = ESTADOS.map(
    (estado) => `${estado} ${tarefas.filter((tarefa) => tarefa.estado === estado).length}`,
  );
  return [`  ${partes.slice(0, 4).join(" · ")}`, `  ${partes.slice(4).join(" · ")}`];
}

function listaEmLinhas(rotulo: string, ids: string[]): string[] {
  if (ids.length === 0) return [`  ${rotulo}: —`];

  const prefixo = `  ${rotulo}: `;
  const linhas: string[] = [];
  let atual = prefixo;

  for (const id of ids) {
    const separador = atual === prefixo ? "" : ", ";
    if (atual.length + separador.length + id.length > LARGURA && atual !== prefixo) {
      linhas.push(atual);
      atual = `    ${id}`;
    } else {
      atual += `${separador}${id}`;
    }
  }
  linhas.push(atual);
  return linhas;
}

export function renderizarPainel(plano: Plano): string {
  const linhas = ["PAINEL — PsicoGestão NR-1", ""];

  for (const etapa of plano.etapas) {
    const tarefas = tarefasDaEtapa(plano, etapa.id);
    const quantidade = `${tarefas.length} ${tarefas.length === 1 ? "tarefa" : "tarefas"}`;
    linhas.push(`${etapa.id} — ${etapa.titulo} — ${quantidade}`);

    if (tarefas.length > 0) {
      linhas.push(...contagens(tarefas));
      for (const estado of ESTADOS_ATIVOS) {
        const ids = tarefas.filter((tarefa) => tarefa.estado === estado).map((tarefa) => tarefa.id);
        linhas.push(...listaEmLinhas(estado, ids));
      }
    }

    linhas.push("");
  }

  while (linhas[linhas.length - 1] === "") linhas.pop();
  return linhas.join("\n");
}

function escaparMarkdown(texto: string): string {
  return texto.replace(/\|/g, "\\|");
}

export function renderizarQuadroMarkdown(plano: Plano): string {
  const secoes: string[] = [];

  for (const etapa of plano.etapas) {
    const tarefas = tarefasDaEtapa(plano, etapa.id);
    const linhas = [`### ${escaparMarkdown(etapa.id)} — ${escaparMarkdown(etapa.titulo)}`, ""];

    if (tarefas.length === 0) {
      linhas.push("_Sem tarefas._");
    } else {
      linhas.push("| Estado | Quantidade | Tarefas |", "|---|---|---|");
      for (const estado of ESTADOS) {
        const ids = tarefas.filter((tarefa) => tarefa.estado === estado).map((tarefa) => tarefa.id);
        const lista = ids.length > 0 ? ids.map(escaparMarkdown).join(", ") : "—";
        linhas.push(`| ${estado} | ${ids.length} | ${lista} |`);
      }
    }

    secoes.push(linhas.join("\n"));
  }

  return secoes.join("\n\n");
}

export const MARCADOR_INICIO = "<!-- painel:inicio -->";
export const MARCADOR_FIM = "<!-- painel:fim -->";

export function atualizarBlocoStatus(conteudo: string, quadro: string): string {
  const bloco = `${MARCADOR_INICIO}\n${quadro}\n${MARCADOR_FIM}`;
  const inicio = conteudo.indexOf(MARCADOR_INICIO);
  const fim = conteudo.indexOf(MARCADOR_FIM);

  if (inicio !== -1 && fim !== -1 && fim > inicio) {
    return `${conteudo.slice(0, inicio)}${bloco}${conteudo.slice(fim + MARCADOR_FIM.length)}`;
  }

  if (conteudo === "") return `${bloco}\n`;

  const separador = conteudo.endsWith("\n") ? "\n" : "\n\n";
  return `${conteudo}${separador}${bloco}\n`;
}

export function renderizarTarefa(plano: Plano, eventos: Evento[], id: string): string {
  const tarefa = plano.tarefas.find((item) => item.id === id);
  if (tarefa === undefined) {
    throw new Error(`Tarefa desconhecida: ${id}.`);
  }

  const etapa = plano.etapas.find((item) => item.id === tarefa.etapa);
  const nomeEtapa = etapa === undefined ? tarefa.etapa : `${etapa.id} — ${etapa.titulo}`;
  const linhas = [
    `${tarefa.id} — ${tarefa.titulo}`,
    `Etapa: ${nomeEtapa} · papel: ${tarefa.papel} · estado: ${tarefa.estado}`,
    "",
    "Histórico:",
  ];

  const historico = eventos.filter((evento) => evento.tarefa === id);
  if (historico.length === 0) {
    linhas.push("  (sem eventos)");
  } else {
    for (const evento of historico) {
      const nota = evento.nota === undefined ? "" : ` — ${evento.nota}`;
      linhas.push(`  ${evento.ts}  ${evento.de} → ${evento.para} (${evento.por})${nota}`);
    }
  }

  return linhas.join("\n");
}
