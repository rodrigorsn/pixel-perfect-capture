import { afterEach, describe, expect, it, vi } from "vitest";
import { demoSuggestionProvider, type SuggestionContext } from "./suggestions";

function context(overrides?: Partial<SuggestionContext>): SuggestionContext {
  return {
    companyName: "Empresa fictícia",
    activityContext: "Operação demonstrativa",
    risks: [
      {
        id: "risk-1",
        code: "PSI-001",
        hazard: "Sobrecarga de trabalho",
        situationDescription: "Ritmo intenso fictício.",
        departmentName: "Produção",
        campaignId: "camp-1",
        departmentId: "dep-1",
        reviewStage: "avaliado",
        classification: "alto",
        existingMeasures: "Pausas programadas.",
        exposure: "Diária.",
      },
    ],
    aggregatedResults: [
      {
        dimensionName: "Carga e ritmo",
        status: "interpretacao_pendente",
        score: 72.5,
        campaignId: "camp-1",
        departmentId: "dep-1",
      },
      {
        dimensionName: "Grupo protegido",
        status: "suprimido_privacidade",
        score: null,
        campaignId: "camp-1",
        departmentId: "dep-1",
      },
    ],
    evidenceAndLimitations: "Dados fictícios e agregados.",
    resourcesAndConstraints: "Equipe demonstrativa.",
    ...overrides,
  };
}

async function generate(input: SuggestionContext) {
  const pending = demoSuggestionProvider.generate(input);
  await vi.runAllTimersAsync();
  return pending;
}

afterEach(() => vi.useRealTimers());

describe("provedor demonstrativo de sugestões", () => {
  it("recusa geração sem risco selecionado", async () => {
    vi.useFakeTimers();
    const pending = demoSuggestionProvider.generate(context({ risks: [] }));
    const assertion = expect(pending).rejects.toThrow(
      "Selecione ao menos um risco para gerar sugestões.",
    );

    await vi.runAllTimersAsync();
    await assertion;
  });

  it("gera proposta aprovável para risco avaliado sem incorporar grupo suprimido", async () => {
    vi.useFakeTimers();

    const [suggestion] = await generate(context());

    expect(suggestion?.exploratory).toBe(false);
    expect(suggestion?.status).toBe("pendente");
    expect(suggestion?.generatedProposal).toBeNull();
    expect(suggestion?.rationale).toContain("Carga e ritmo (72.5)");
    expect(suggestion?.rationale).not.toContain("Grupo protegido");
  });

  it("recusa riscos de campanhas ou setores diferentes no mesmo contexto", async () => {
    const input = context({ risks: [{ ...context().risks[0]!, campaignId: "camp-a", departmentId: "dep-a" }, { ...context().risks[0]!, id: "risk-2", campaignId: "camp-b", departmentId: "dep-b" }] });
    await expect(demoSuggestionProvider.generate(input)).rejects.toThrow("mesmo escopo");
  });

  it("mantém exploratória a proposta de risco ainda não avaliado", async () => {
    vi.useFakeTimers();
    const input = context();
    const risk = input.risks[0];
    if (!risk) throw new Error("Fixture sem risco");
    risk.reviewStage = "em_analise";

    const [suggestion] = await generate(input);

    expect(suggestion?.exploratory).toBe(true);
    expect(suggestion?.missingInformation).toContain(
      "Conclusão da avaliação do risco com critérios definidos.",
    );
  });
});
