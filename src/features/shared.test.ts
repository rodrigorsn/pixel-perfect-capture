import { describe, expect, it } from "vitest";
import { createDemoDatabase } from "@/domain/demo-data";
import { campaignResults } from "./shared";

describe("resultados da campanha", () => {
  it("aplica supressão primária e complementar a todas as dimensões do grupo", () => {
    const db = createDemoDatabase();
    const campaign = db.campaigns[0];
    if (!campaign) throw new Error("Campanha demonstrativa ausente");

    const results = campaignResults(db, campaign);
    const suppressed = results.filter((result) => result.suppressed);

    expect(suppressed.map((result) => result.scopeId)).toEqual([
      "dep-administrativo",
      "dep-diretoria",
    ]);
    expect(
      suppressed.every((result) =>
        result.dimensions.every(
          (dimension) => dimension.score === null && dimension.status === "suprimido_privacidade",
        ),
      ),
    ).toBe(true);
  });

  it("calcula somente com o snapshot congelado da campanha", () => {
    const db = createDemoDatabase();
    const campaign = db.campaigns[0];
    if (!campaign?.instrumentSnapshot) {
      throw new Error("Snapshot demonstrativo ausente");
    }
    const frozenName = campaign.instrumentSnapshot.dimensions[0]?.name;
    const catalog = db.instruments.find((instrument) => instrument.id === campaign.instrumentId);
    if (!catalog?.dimensions[0]) throw new Error("Instrumento ausente");
    catalog.dimensions[0].name = "Nome alterado apenas no catálogo";

    const result = campaignResults(db, campaign);

    expect(result[0]?.dimensions[0]?.dimensionName).toBe(frozenName);
  });
});
