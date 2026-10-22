import type { ActionPlanItem, ActionSuggestion, Database, RiskAssessment } from "./types";
export interface ActionValidationInput { riskIds: string[]; title: string; measure: string; responsible: string; dueDate: string; executionIndicator: string; effectivenessIndicator: string; verificationMethod: string; }
export function validateActionInput(input: ActionValidationInput, risks: RiskAssessment[], campaignId?: string): string | null {
  if (input.riskIds.length === 0) return "Vincule ao menos um risco válido.";
  if (!input.title.trim() || !input.measure.trim() || !input.responsible.trim()) return "Título, medida e responsável são obrigatórios.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate) || Number.isNaN(Date.parse(input.dueDate))) return "Informe um prazo válido.";
  if (!input.executionIndicator.trim() || !input.effectivenessIndicator.trim() || !input.verificationMethod.trim() || /a definir/i.test(`${input.effectivenessIndicator} ${input.verificationMethod}`)) return "Informe execução, eficácia e método de verificação.";
  const linked = input.riskIds.map((id) => risks.find((risk) => risk.id === id));
  if (linked.some((risk) => !risk)) return "Todos os riscos vinculados devem existir.";
  if (campaignId && linked.some((risk) => risk?.originCampaignId !== campaignId)) return "Os riscos devem pertencer à campanha da ação.";
  return null;
}
export function approveSuggestion(db: Database, requested: ActionSuggestion, now = new Date()): { db: Database; error: string | null; changed: boolean } {
  const suggestion = db.suggestions.find((item) => item.id === requested.id);
  if (!suggestion) return { db, error: "Sugestão não encontrada.", changed: false };
  if (suggestion.status === "aprovada") return { db, error: null, changed: false };
  if (suggestion.status !== "pendente") return { db, error: "Somente sugestões pendentes podem ser aprovadas.", changed: false };
  const risks = suggestion.riskIds.map((id) => db.risks.find((risk) => risk.id === id));
  if (risks.some((risk) => !risk || risk.reviewStage !== "avaliado")) return { db, error: "Avalie todos os riscos atuais antes de aprovar.", changed: false };
  const concreteRisks = risks as RiskAssessment[];
  if (concreteRisks.some((risk) => risk.originCampaignId !== suggestion.campaignId || risk.departmentId !== suggestion.departmentId)) return { db, error: "Riscos e sugestão estão fora do mesmo escopo.", changed: false };
  const date = new Date(now); const deadlineMatch = suggestion.estimatedDeadline.match(/(\d+)\s*dias?/i); date.setDate(date.getDate() + (deadlineMatch ? Number(deadlineMatch[1]) : 90));
  const input: ActionValidationInput = { riskIds: suggestion.riskIds, title: suggestion.title, measure: suggestion.measure, responsible: suggestion.responsibleRole, dueDate: date.toISOString().slice(0, 10), executionIndicator: suggestion.executionIndicator, effectivenessIndicator: suggestion.effectivenessIndicator, verificationMethod: suggestion.verificationMethod };
  const error = validateActionInput(input, concreteRisks, suggestion.campaignId); if (error) return { db, error, changed: false };
  const action: ActionPlanItem = { id: `act-${suggestion.id}`, ...input, followUpCriteria: input.executionIndicator, origin: "sugestao_simulada", originalProposal: structuredClone(suggestion.generatedProposal ?? suggestion), sourceSuggestionId: suggestion.id, status: "aprovada", implementedAt: null, effectivenessCheckedAt: null, effectivenessResult: null, createdAt: now.toISOString() };
  return { db: { ...db, suggestions: db.suggestions.map((item) => item.id === suggestion.id ? { ...item, status: "aprovada" } : item), actions: db.actions.some((item) => item.sourceSuggestionId === suggestion.id) ? db.actions : [...db.actions, action] }, error: null, changed: true };
}
