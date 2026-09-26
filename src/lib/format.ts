export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00.000Z` : iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(d);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isOverdue(dueDate: string, status: string): boolean {
  const done = ["concluida", "cancelada", "implementada", "em_verificacao_eficacia"];
  if (done.includes(status)) return false;
  return dueDate < todayISO();
}

export const CAMPAIGN_STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  aberta: "Aberta",
  encerrada: "Encerrada",
  em_analise: "Em análise",
  finalizada: "Finalizada",
};

export const RISK_STAGE_LABEL: Record<string, string> = {
  em_analise: "Em análise",
  aguardando_informacoes: "Aguardando informações",
  avaliado: "Avaliado",
};

export const RISK_CLASS_LABEL: Record<string, string> = {
  avaliacao_pendente: "Avaliação pendente",
  baixo: "Baixo",
  moderado: "Moderado",
  alto: "Alto",
  muito_alto: "Muito alto",
};

export const ACTION_STATUS_LABEL: Record<string, string> = {
  proposta: "Proposta",
  aprovada: "Aprovada",
  em_andamento: "Em andamento",
  implementada: "Implementada",
  em_verificacao_eficacia: "Em verificação de eficácia",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const REGIME_LABEL: Record<string, string> = {
  presencial: "Presencial",
  remoto: "Remoto",
  hibrido: "Híbrido",
};

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
