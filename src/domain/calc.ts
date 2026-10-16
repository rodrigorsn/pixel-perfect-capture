import type { AnonymousResponse, CalculationResult, DimensionResult, InstrumentVersion } from "./types";
import { isSuppressed } from "./privacy";

export interface CalcOptions { minGroupSize: number; minRespondentsPerDimension?: number; suppressedDimensionIds?: ReadonlySet<string>; }
export type ResponseValidation = { valid: true } | { valid: false; reason: string };
export function validateAnswer(value: unknown, instrument: InstrumentVersion): boolean { return (value === null || value === undefined) || (typeof value === "number" && Number.isFinite(value) && instrument.options.some((option) => option.value === value)); }
export function validateResponse(response: AnonymousResponse, instrument: InstrumentVersion): ResponseValidation {
  if (response.instrumentId !== instrument.id) return { valid: false, reason: "instrumento_incompatível" };
  if (response.rulesVersion !== instrument.rulesVersion) return { valid: false, reason: "versão_incompatível" };
  for (const question of instrument.questions) if (!validateAnswer(response.answers[question.id], instrument)) return { valid: false, reason: `resposta_inválida:${question.id}` };
  return { valid: true };
}
export function scoreItem(value: number, options: { value: number }[], reverse: boolean): number { if (!Number.isFinite(value) || !options.some((option) => option.value === value)) throw new Error("Valor de resposta inválido."); const max = Math.max(...options.map((o) => o.value)); const min = Math.min(...options.map((o) => o.value)); const span = max - min || 1; const normalized = ((value - min) / span) * 100; return reverse ? 100 - normalized : normalized; }
export function calculateScope(params: { campaignId: string; scopeId: string; scopeLabel: string; instrument: InstrumentVersion; responses: AnonymousResponse[]; options: CalcOptions }): CalculationResult {
  const { campaignId, scopeId, scopeLabel, instrument, options } = params; const minRespondents = options.minRespondentsPerDimension ?? 3;
  const responses = params.responses.filter((response) => response.campaignId === campaignId && validateResponse(response, instrument).valid);
  const dimensions: DimensionResult[] = instrument.dimensions.map((dim) => {
    const items = instrument.questions.filter((q) => q.dimensionId === dim.id);
    const base: DimensionResult = { dimensionId: dim.id, dimensionName: dim.name, direction: dim.direction, status: "nao_avaliado", score: null, validRespondents: 0, eligibleRespondents: responses.length, answeredItems: 0, expectedItems: items.length * responses.length, interpretation: "Sem referência interpretativa verificada. Resultado apresentado de forma descritiva.", note: "" };
    if (items.length === 0) return { ...base, note: "Dimensão sem itens definidos no instrumento." };
    const perRespondent: number[] = []; let answeredItems = 0;
    for (const response of responses) { const values: number[] = []; for (const item of items) { const raw = response.answers[item.id]; if (raw === null || raw === undefined) continue; answeredItems += 1; values.push(scoreItem(raw, instrument.options, item.reverse)); } if (values.length >= dim.minValidItems) perRespondent.push(values.reduce((a, b) => a + b, 0) / values.length); }
    const privacySuppressed = options.suppressedDimensionIds?.has(dim.id) ?? isSuppressed(perRespondent.length, options.minGroupSize);
    if (privacySuppressed) return { ...base, answeredItems, validRespondents: perRespondent.length, status: "suprimido_privacidade" };
    if (perRespondent.length < minRespondents) return { ...base, answeredItems, validRespondents: perRespondent.length, status: "dados_insuficientes", note: `Apenas ${perRespondent.length} participante(s) atenderam ao mínimo de itens respondidos desta dimensão (mínimo de ${minRespondents}).` };
    const score = perRespondent.reduce((a, b) => a + b, 0) / perRespondent.length;
    return { ...base, answeredItems, validRespondents: perRespondent.length, score: Math.round(score * 10) / 10, status: instrument.interpretationReference ? "calculado" : "interpretacao_pendente", note: dim.direction === "maior_pior" ? "Escala em que pontuação maior indica situação mais desfavorável." : "Escala em que pontuação maior indica situação mais favorável." };
  });
  return { scopeId, scopeLabel, campaignId, instrumentId: instrument.id, rulesVersion: instrument.rulesVersion, calculatedAt: new Date().toISOString(), totalResponses: responses.length, suppressed: dimensions.length > 0 && dimensions.every((dimension) => dimension.status === "suprimido_privacidade"), dimensions };
}
export function completeness(responses: AnonymousResponse[], instrument: InstrumentVersion): number { const compatible = responses.filter((response) => validateResponse(response, instrument).valid); const expected = compatible.length * instrument.questions.length; if (expected === 0) return 0; let answered = 0; for (const response of compatible) for (const question of instrument.questions) if (response.answers[question.id] !== null && response.answers[question.id] !== undefined) answered += 1; return Math.round((answered / expected) * 100); }
export const RESULT_STATUS_LABEL: Record<string, string> = { calculado: "Calculado", dados_insuficientes: "Dados insuficientes", nao_avaliado: "Não avaliado", suprimido_privacidade: "Suprimido por privacidade", interpretacao_pendente: "Calculado — interpretação pendente" };