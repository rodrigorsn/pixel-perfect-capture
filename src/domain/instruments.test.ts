import { describe, expect, it } from "vitest";
import { DEFAULT_INSTRUMENTS, DEMO_INSTRUMENT, isInstrumentEligible } from "./instruments";

describe("elegibilidade de instrumentos", () => {
  it("permite o instrumento demonstrativo íntegro", () => {
    expect(isInstrumentEligible(DEMO_INSTRUMENT)).toBe(true);
  });

  it("mantém COPSOQ pendente bloqueado mesmo com perguntas", () => {
    const original = DEFAULT_INSTRUMENTS.find((instrument) => instrument.family === "COPSOQ");
    if (!original) throw new Error("COPSOQ ausente");
    const pending = { ...original, questions: [...DEMO_INSTRUMENT.questions] };
    expect(isInstrumentEligible(pending)).toBe(false);
  });
});
