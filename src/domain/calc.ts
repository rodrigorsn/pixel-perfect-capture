import type {
  AnonymousResponse,
  CalculationResult,
  DimensionResult,
  InstrumentVersion,
} from "./types";
import { isSuppressed } from "./privacy";

/**
 * Motor de cálculo determinístico.
 * Independente da interface e do serviço de sugestões.
 */

export interface CalcOptions {
  minGroupSize: number;
  /** Mínimo de participantes válidos para considerar uma dimensão calculável. */
  minRespondentsPerDimension?: number;
}

export function scoreItem(
  value: number,
  options: { value: number }[],
  reverse: boolean,
): number {
  const max = Math.max(...options.map((o) => o.value));
  const min = Math.min(...options.map((o) => o.value));
  const span = max - min || 1;
  const normalized = ((value - min) / span) * 100;
  return reverse ? 100 - normalized : normalized;
}

export function calculateScope(params: {
  campaignId: string;
  scopeId: string;
  scopeLabel: string;
  instrument: InstrumentVersion;
  responses: AnonymousResponse[];
  options: CalcOptions;
}): CalculationResult {
  const { campaignId, scopeId, scopeLabel, instrument, responses, options } = params;
  const minRespondents = options.minRespondentsPerDimension ?? 3;
  const suppressed = isSuppressed(responses.length, options.minGroupSize);

  const dimensions: DimensionResult[] = instrument.dimensions.map((dim) => {
    const items = instrument.questions.filter((q) => q.dimensionId === dim.id);
    const base: DimensionResult = {
      dimensionId: dim.id,
      dimensionName: dim.name,
      direction: dim.direction,
      status: "nao_avaliado",
      score: null,
      validRespondents: 0,
      eligibleRespondents: responses.length,
      answeredItems: 0,
      expectedItems: items.length * responses.length,
      interpretation:
        "Sem referência interpretativa verificada. Resultado apresentado de forma descritiva.",
      note: "",
    };

    if (items.length === 0) {
      return { ...base, note: "Dimensão sem itens definidos no instrumento." };
    }

    const perRespondent: number[] = [];
    let answeredItems = 0;

    for (const r of responses) {
      const values: number[] = [];
      for (const item of items) {
        const raw = r.answers[item.id];
        // Resposta ausente é excluída — nunca convertida em zero.
        if (raw === null || raw === undefined) continue;
        answeredItems += 1;
        values.push(scoreItem(raw, instrument.options, item.reverse));
      }
      if (values.length >= dim.minValidItems) {
        perRespondent.push(values.reduce((a, b) => a + b, 0) / values.length);
      }
    }

    if (suppressed) {
      return {
        ...base,
        answeredItems,
        validRespondents: perRespondent.length,
        status: "suprimido_privacidade",
      };
    }

    if (perRespondent.length < minRespondents) {
      return {
        ...base,
        answeredItems,
        validRespondents: perRespondent.length,
        status: "dados_insuficientes",
        note: `Apenas ${perRespondent.length} participante(s) atenderam ao mínimo de itens respondidos desta dimensão (mínimo de ${minRespondents}).`,
      };
    }

    const score =
      perRespondent.reduce((a, b) => a + b, 0) / perRespondent.length;

    return {
      ...base,
      answeredItems,
      validRespondents: perRespondent.length,
      score: Math.round(score * 10) / 10,
      status: instrument.interpretationReference ? "calculado" : "interpretacao_pendente",
      note:
        dim.direction === "maior_pior"
          ? "Escala em que pontuação maior indica situação mais desfavorável."
          : "Escala em que pontuação maior indica situação mais favorável.",
    };
  });

  return {
    scopeId,
    scopeLabel,
    campaignId,
    instrumentId: instrument.id,
    rulesVersion: instrument.rulesVersion,
    calculatedAt: new Date().toISOString(),
    totalResponses: responses.length,
    suppressed,
    dimensions,
  };
}

export function completeness(
  responses: AnonymousResponse[],
  instrument: InstrumentVersion,
): number {
  const expected = responses.length * instrument.questions.length;
  if (expected === 0) return 0;
  let answered = 0;
  for (const r of responses)
    for (const q of instrument.questions)
      if (r.answers[q.id] !== null && r.answers[q.id] !== undefined) answered += 1;
  return Math.round((answered / expected) * 100);
}

export const RESULT_STATUS_LABEL: Record<string, string> = {
  calculado: "Calculado",
  dados_insuficientes: "Dados insuficientes",
  nao_avaliado: "Não avaliado",
  suprimido_privacidade: "Suprimido por privacidade",
  interpretacao_pendente: "Calculado — interpretação pendente",
};
