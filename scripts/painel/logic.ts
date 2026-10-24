import type { Estado, Evento, Pessoa, Tarefa, Plano } from "./types";
import { ESTADOS, PESSOAS_VALIDAS } from "./types";

export interface ErroTransicao {
  erro: string;
}

export interface OkTransicao {
  tarefa: Tarefa;
  evento: Evento;
}

const TRANSICOES_DIRETAS: Partial<Record<Estado, Estado[]>> = {
  a_fazer: ["em_andamento"],
  em_andamento: ["em_revisao"],
  em_revisao: ["em_qa", "em_andamento"],
  em_qa: ["aguardando_rodrigo", "em_andamento"],
  aguardando_rodrigo: ["concluida", "em_andamento"],
};

export function estadoAnteriorBloqueio(eventos: Evento[], id: string): Estado | null {
  for (let i = eventos.length - 1; i >= 0; i--) {
    const e = eventos[i];
    if (!e) {
      continue;
    }
    if (e.tarefa === id && e.para === "bloqueada") {
      return e.de;
    }
  }
  return null;
}

export function transicaoValida(
  tarefa: Tarefa,
  novoEstado: Estado,
  eventos: Evento[],
  nota: string | undefined,
): { ok: true } | { ok: false; erro: string } {
  if (tarefa.estado === novoEstado) {
    return { ok: false, erro: `${tarefa.id} já está em ${novoEstado}` };
  }

  if (tarefa.estado === "concluida" && novoEstado !== "concluida") {
    return { ok: false, erro: `${tarefa.id} está concluída e não pode ser alterada` };
  }

  if (novoEstado === "bloqueada") {
    if (!nota || nota.trim() === "") {
      return { ok: false, erro: "nota é obrigatória para bloquear" };
    }
    return { ok: true };
  }

  if (tarefa.estado === "bloqueada") {
    const anterior = estadoAnteriorBloqueio(eventos, tarefa.id);
    if (anterior === null) {
      return { ok: false, erro: `${tarefa.id} bloqueada sem histórico de bloqueio` };
    }
    if (novoEstado !== anterior) {
      return { ok: false, erro: `desbloqueio deve voltar para ${anterior}, não ${novoEstado}` };
    }
    return { ok: true };
  }

  const destinos = TRANSICOES_DIRETAS[tarefa.estado] ?? [];
  if (!destinos.includes(novoEstado)) {
    return { ok: false, erro: `transição inválida de ${tarefa.estado} para ${novoEstado}` };
  }

  const precisaDeNota =
    (tarefa.estado === "em_revisao" && novoEstado === "em_andamento") ||
    (tarefa.estado === "em_qa" && novoEstado === "em_andamento") ||
    (tarefa.estado === "aguardando_rodrigo" && novoEstado === "em_andamento");

  if (precisaDeNota && (!nota || nota.trim() === "")) {
    return { ok: false, erro: "nota é obrigatória para devolver à em_andamento" };
  }

  return { ok: true };
}

export function outraEmAndamentoNaEtapa(
  plano: Plano,
  id: string,
  etapa: string,
): Tarefa | undefined {
  return plano.tarefas.find(
    (t) => t.etapa === etapa && t.id !== id && t.papel === "D" && t.estado === "em_andamento",
  );
}

export function podeIniciar(
  plano: Plano,
  tarefa: Tarefa,
  novoEstado: Estado,
): { ok: true } | { ok: false; erro: string } {
  if (novoEstado !== "em_andamento" || tarefa.papel !== "D") {
    return { ok: true };
  }

  const permitidasJuntas = new Set(["E0-T00", "E0-T05"]);
  const outra = outraEmAndamentoNaEtapa(plano, tarefa.id, tarefa.etapa);
  if (!outra) {
    return { ok: true };
  }

  if (permitidasJuntas.has(tarefa.id) && permitidasJuntas.has(outra.id)) {
    return { ok: true };
  }

  return {
    ok: false,
    erro: `já existe ${outra.id} em_andamento na ${tarefa.etapa}; só 1 tarefa D por etapa`,
  };
}

export function validarTransicao(
  plano: Plano,
  id: string,
  novoEstado: Estado,
  eventos: Evento[],
  por: Pessoa,
  nota: string | undefined,
): OkTransicao | ErroTransicao {
  if (!ESTADOS.includes(novoEstado)) {
    return { erro: `estado inválido: ${novoEstado}` };
  }

  if (!PESSOAS_VALIDAS.includes(por)) {
    return { erro: `pessoa inválida: ${por}` };
  }

  const tarefa = plano.tarefas.find((t) => t.id === id);
  if (!tarefa) {
    return { erro: `tarefa não encontrada: ${id}` };
  }

  const valida = transicaoValida(tarefa, novoEstado, eventos, nota);
  if (!valida.ok) {
    return { erro: valida.erro };
  }

  const pode = podeIniciar(plano, tarefa, novoEstado);
  if (!pode.ok) {
    return { erro: pode.erro };
  }

  const evento: Evento = {
    ts: new Date().toISOString(),
    tarefa: id,
    de: tarefa.estado,
    para: novoEstado,
    por,
    ...(nota && nota.trim() !== "" ? { nota: nota.trim() } : {}),
  };

  const atualizada: Tarefa = { ...tarefa, estado: novoEstado };
  return { tarefa: atualizada, evento };
}

export function aplicarTransicao(plano: Plano, tarefaAtualizada: Tarefa): Plano {
  return {
    ...plano,
    tarefas: plano.tarefas.map((t) => (t.id === tarefaAtualizada.id ? tarefaAtualizada : t)),
  };
}

export function historicoTarefa(eventos: Evento[], id: string): Evento[] {
  return eventos.filter((e) => e.tarefa === id);
}

export function contagemPorEstado(tarefas: Tarefa[]): Record<Estado, number> {
  const contagem: Record<Estado, number> = {
    a_fazer: 0,
    em_andamento: 0,
    em_revisao: 0,
    em_qa: 0,
    aguardando_rodrigo: 0,
    concluida: 0,
    bloqueada: 0,
  };
  for (const t of tarefas) {
    contagem[t.estado]++;
  }
  return contagem;
}

export function formatarConfirmacao(evento: Evento): string {
  return `${evento.tarefa}: ${evento.de} → ${evento.para} (${evento.por})`;
}

export function formatarTarefaResumida(tarefa: Tarefa): string {
  return `${tarefa.id} — ${tarefa.titulo}`;
}

function linhaContagem(tarefas: Tarefa[]): string {
  const c = contagemPorEstado(tarefas);
  return [
    `a_fazer: ${c.a_fazer}`,
    `em_andamento: ${c.em_andamento}`,
    `em_revisao: ${c.em_revisao}`,
    `em_qa: ${c.em_qa}`,
    `aguardando_rodrigo: ${c.aguardando_rodrigo}`,
    `concluida: ${c.concluida}`,
    `bloqueada: ${c.bloqueada}`,
  ].join("  ");
}

function formatarLista(estado: Estado, tarefas: Tarefa[]): string[] {
  const selecionadas = tarefas.filter((t) => t.estado === estado);
  if (selecionadas.length === 0) {
    return [];
  }
  const label = `[${estado}]`;
  return selecionadas.map((t) => `  ${label} ${formatarTarefaResumida(t)}`);
}

export function formatarPainel(plano: Plano, agora?: Date): string {
  const ts = (agora ?? new Date()).toISOString();
  const linhas: string[] = [`PsicoGestão NR-1 — Painel de tarefas (${ts})`, ""];

  for (const etapa of plano.etapas) {
    const tarefas = plano.tarefas.filter((t) => t.etapa === etapa.id);
    linhas.push(`${etapa.id} — ${etapa.titulo}`);
    linhas.push(`  ${linhaContagem(tarefas)}`);

    for (const estado of [
      "em_andamento",
      "em_revisao",
      "em_qa",
      "aguardando_rodrigo",
      "bloqueada",
    ] as Estado[]) {
      linhas.push(...formatarLista(estado, tarefas));
    }

    linhas.push("");
  }

  return linhas.join("\n").trimEnd() + "\n";
}

export function formatarStatus(plano: Plano): string {
  const linhas: string[] = [
    "<!-- painel:inicio -->",
    "*Gerado automaticamente por `bun run status`.*",
    "",
    "| Etapa | a_fazer | em_andamento | em_revisao | em_qa | aguardando_rodrigo | concluida | bloqueada |",
    "|-------|---------|--------------|------------|-------|--------------------|-----------|-----------|",
  ];

  for (const etapa of plano.etapas) {
    const tarefas = plano.tarefas.filter((t) => t.etapa === etapa.id);
    const c = contagemPorEstado(tarefas);
    linhas.push(
      `| ${etapa.id} — ${etapa.titulo} | ${c.a_fazer} | ${c.em_andamento} | ${c.em_revisao} | ${c.em_qa} | ${c.aguardando_rodrigo} | ${c.concluida} | ${c.bloqueada} |`,
    );
  }

  for (const estado of [
    "em_andamento",
    "em_revisao",
    "em_qa",
    "aguardando_rodrigo",
    "bloqueada",
  ] as Estado[]) {
    const selecionadas = plano.tarefas.filter((t) => t.estado === estado);
    if (selecionadas.length === 0) {
      continue;
    }
    linhas.push("", `### ${estado.replace(/_/g, " ")}`);
    for (const t of selecionadas) {
      linhas.push(`- **${t.id}** — ${t.etapa}: ${t.titulo}`);
    }
  }

  linhas.push("<!-- painel:fim -->");
  return linhas.join("\n") + "\n";
}

export function formatarDetalheTarefa(tarefa: Tarefa, eventos: Evento[]): string {
  const linhas: string[] = [
    `${tarefa.id}: ${tarefa.titulo}`,
    `Etapa: ${tarefa.etapa}  Papel: ${tarefa.papel}  Estado: ${tarefa.estado}`,
    "",
    "Histórico:",
  ];

  const historico = historicoTarefa(eventos, tarefa.id);
  if (historico.length === 0) {
    linhas.push("  (sem eventos)");
  } else {
    for (const e of historico) {
      const nota = e.nota ? ` — ${e.nota}` : "";
      linhas.push(`  ${e.ts}: ${e.de} → ${e.para} (${e.por})${nota}`);
    }
  }

  return linhas.join("\n") + "\n";
}

export function atualizarStatusMarkdown(conteudoAtual: string, blocoPainel: string): string {
  const inicio = "<!-- painel:inicio -->";
  const fim = "<!-- painel:fim -->";

  const idxInicio = conteudoAtual.indexOf(inicio);
  const idxFim = conteudoAtual.indexOf(fim);

  if (idxInicio === -1 || idxFim === -1) {
    const separador = conteudoAtual.endsWith("\n") ? "" : "\n\n";
    return conteudoAtual + separador + blocoPainel;
  }

  const antes = conteudoAtual.slice(0, idxInicio);
  const depois = conteudoAtual.slice(idxFim + fim.length);
  return (antes + blocoPainel + depois).replace(/\n{3,}/g, "\n\n");
}
