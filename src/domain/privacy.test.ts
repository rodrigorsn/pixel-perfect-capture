import { describe, expect, it } from "vitest";
import { applyComplementarySuppression, isSuppressed } from "./privacy";

describe("política de privacidade", () => {
  it("mantém o limite inclusivo: o grupo com exatamente o mínimo é liberado", () => {
    expect(isSuppressed(4, 5)).toBe(true);
    expect(isSuppressed(5, 5)).toBe(false);
  });

  it("suprime complementarmente o menor grupo visível quando só um grupo é pequeno", () => {
    const result = applyComplementarySuppression(
      [
        { id: "pequeno", count: 3 },
        { id: "menor-visivel", count: 5 },
        { id: "maior", count: 12 },
      ],
      5,
    );

    expect(result.map(({ id, suppressed }) => ({ id, suppressed }))).toEqual([
      { id: "pequeno", suppressed: true },
      { id: "menor-visivel", suppressed: true },
      { id: "maior", suppressed: false },
    ]);
  });

  it("não acrescenta supressão quando nenhum ou mais de um grupo já está suprimido", () => {
    expect(
      applyComplementarySuppression([{ count: 5 }, { count: 8 }], 5).map(
        (group) => group.suppressed,
      ),
    ).toEqual([false, false]);
    expect(
      applyComplementarySuppression([{ count: 2 }, { count: 4 }, { count: 8 }], 5).map(
        (group) => group.suppressed,
      ),
    ).toEqual([true, true, false]);
  });
});
