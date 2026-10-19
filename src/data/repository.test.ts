import { afterEach, describe, expect, it, vi } from "vitest";
import { localRepository } from "./repository";

const STORAGE_KEY = "psicogestao-nr1:db:v1";

function localStorageDouble(initial?: Record<string, string>) {
  const values = new Map(Object.entries(initial ?? {}));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() {
      return values.size;
    },
  } satisfies Storage;
}

afterEach(() => vi.unstubAllGlobals());

describe("repositório local", () => {
  it("inicializa e persiste dados fictícios quando não há banco salvo", () => {
    const localStorage = localStorageDouble();
    vi.stubGlobal("window", { localStorage });

    const db = localRepository.load();

    expect(db.version).toBe(1);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")).toEqual(db);
  });

  it("substitui armazenamento corrompido por uma base íntegra persistida", () => {
    const localStorage = localStorageDouble({ [STORAGE_KEY]: "{invalido" });
    vi.stubGlobal("window", { localStorage });

    const db = localRepository.load();

    expect(db.version).toBe(1);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")).toEqual(db);
  });
  it("comunica falha de gravação sem afirmar persistência", () => {
    const localStorage = localStorageDouble();
    localStorage.setItem = () => {
      throw new Error("quota");
    };
    vi.stubGlobal("window", { localStorage });
    expect(localRepository.save(localRepository.reset())).toBe(false);
  });
});
