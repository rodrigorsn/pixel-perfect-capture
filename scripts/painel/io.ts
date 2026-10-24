import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, appendFileSync } from "node:fs";
import { dirname } from "node:path";
import type { Evento, Plano } from "./types";

export function lerPlano(caminho: string): Plano {
  const raw = readFileSync(caminho, "utf-8");
  return JSON.parse(raw) as Plano;
}

export function gravarPlano(caminho: string, plano: Plano): void {
  const dir = dirname(caminho);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const temp = `${caminho}.tmp.${Date.now()}`;
  writeFileSync(temp, JSON.stringify(plano, null, 2) + "\n", "utf-8");
  renameSync(temp, caminho);
}

export function lerEventos(caminho: string): Evento[] {
  if (!existsSync(caminho)) {
    return [];
  }
  const raw = readFileSync(caminho, "utf-8").trim();
  if (raw === "") {
    return [];
  }
  return raw
    .split("\n")
    .map((linha) => JSON.parse(linha) as Evento);
}

export function acrescentarEvento(caminho: string, evento: Evento): void {
  const dir = dirname(caminho);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  appendFileSync(caminho, JSON.stringify(evento) + "\n", "utf-8");
}

export function lerStatus(caminho: string): string {
  if (!existsSync(caminho)) {
    return "";
  }
  return readFileSync(caminho, "utf-8");
}

export function gravarStatus(caminho: string, conteudo: string): void {
  const dir = dirname(caminho);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(caminho, conteudo, "utf-8");
}
