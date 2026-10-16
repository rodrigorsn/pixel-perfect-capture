import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { localRepository } from "@/data/repository";
import { createDemoDatabase } from "@/domain/demo-data";
import type { Database } from "@/domain/types";

interface StoreValue {
  db: Database;
  hydrated: boolean;
  update: (fn: (db: Database) => Database) => Database;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database>(() => createDemoDatabase());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDb(localRepository.load());
    setHydrated(true);
  }, []);

  const update = useCallback((fn: (current: Database) => Database) => {
    const next = fn(db);
    const persisted = localRepository.save(next);
    const applied = persisted ? next : db;
    setDb(applied);
    return applied;
  }, [db]);
  const resetDemo = useCallback(() => {
    setDb(localRepository.reset());
  }, []);

  const value = useMemo(
    () => ({ db, hydrated, update, resetDemo }),
    [db, hydrated, update, resetDemo],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de StoreProvider");
  return ctx;
}

export function useDb(): Database {
  return useStore().db;
}
