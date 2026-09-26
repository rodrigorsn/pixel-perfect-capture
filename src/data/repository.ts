import { createDemoDatabase } from "@/domain/demo-data";
import type { Database } from "@/domain/types";

/**
 * Isolamento do acesso ao armazenamento.
 * Hoje: localStorage com dados fictícios.
 * Amanhã: trocar esta implementação por chamadas de API sem tocar na interface.
 */
export interface DatabaseRepository {
  load(): Database;
  save(db: Database): void;
  reset(): Database;
}

const STORAGE_KEY = "psicogestao-nr1:db:v1";

export const localRepository: DatabaseRepository = {
  load() {
    if (typeof window === "undefined") return createDemoDatabase();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const fresh = createDemoDatabase();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        return fresh;
      }
      const parsed = JSON.parse(raw) as Database;
      if (!parsed || parsed.version !== 1) return this.reset();
      return parsed;
    } catch {
      return createDemoDatabase();
    }
  },
  save(db) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      /* armazenamento indisponível: a sessão continua apenas em memória */
    }
  },
  reset() {
    const fresh = createDemoDatabase();
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      } catch {
        /* ignora */
      }
    }
    return fresh;
  },
};
