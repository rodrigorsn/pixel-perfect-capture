import type { Database, Campaign, CalculationResult } from "@/domain/types";
import { calculateScope } from "@/domain/calc";
import { applyComplementarySuppression } from "@/domain/privacy";

export function campaignResults(db: Database, campaign: Campaign): CalculationResult[] {
  const instrument = campaign.instrumentSnapshot ?? db.instruments.find((i) => i.id === campaign.instrumentId);
  if (!instrument || instrument.questions.length === 0) return [];
  const responses = db.responses.filter((response) => response.campaignId === campaign.id);
  const base = campaign.departmentIds.map((id) => {
    const department = db.departments.find((item) => item.id === id);
    return calculateScope({ campaignId: campaign.id, scopeId: id, scopeLabel: department?.name ?? id, instrument, responses: responses.filter((response) => response.departmentId === id), options: { minGroupSize: 0 } });
  });
  const suppressedByScope = new Map<string, Set<string>>();
  for (const dimension of instrument.dimensions) {
    const marked = applyComplementarySuppression(base.map((result) => ({ id: result.scopeId, count: result.dimensions.find((item) => item.dimensionId === dimension.id)?.validRespondents ?? 0 })), db.settings.minGroupSize);
    for (const group of marked) if (group.suppressed) {
      const dimensions = suppressedByScope.get(group.id) ?? new Set<string>();
      dimensions.add(dimension.id);
      suppressedByScope.set(group.id, dimensions);
    }
  }
  return base.map((result) => {
    const department = db.departments.find((item) => item.id === result.scopeId);
    const suppressedDimensionIds = suppressedByScope.get(result.scopeId);
    const options = suppressedDimensionIds ? { minGroupSize: db.settings.minGroupSize, suppressedDimensionIds } : { minGroupSize: db.settings.minGroupSize };
    return calculateScope({ campaignId: campaign.id, scopeId: result.scopeId, scopeLabel: department?.name ?? result.scopeId, instrument, responses: responses.filter((response) => response.departmentId === result.scopeId), options });
  });
}

export function statusTone(status: string) { return /alto|atras|pendente|aguardando|insuficiente|suprimido/.test(status) ? "warning" : /avaliado|aprovada|concluida|finalizada/.test(status) ? "success" : "neutral"; }