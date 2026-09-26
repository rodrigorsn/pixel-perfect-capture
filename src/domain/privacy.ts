/**
 * Política de agregação e privacidade do protótipo.
 * O limite é ilustrativo e NÃO é um requisito numérico da NR-1.
 */

export const DEFAULT_MIN_GROUP_SIZE = 5;

export const SUPPRESSION_MESSAGE =
  "Resultado não exibido para preservar a confidencialidade. Considere agregação adequada ou avaliação complementar.";

export const PRIVACY_POLICY_NOTE =
  "O limite mínimo de respostas por grupo é uma política ilustrativa deste protótipo, não um requisito numérico da NR-1.";

export function isSuppressed(count: number, minGroupSize: number): boolean {
  return count < minGroupSize;
}

/**
 * Evita dedução por diferença: se apenas um grupo do conjunto foi suprimido,
 * o grupo com menor contagem entre os visíveis também é suprimido.
 */
export function applyComplementarySuppression<T extends { count: number }>(
  groups: T[],
  minGroupSize: number,
): Array<T & { suppressed: boolean }> {
  const marked = groups.map((g) => ({
    ...g,
    suppressed: isSuppressed(g.count, minGroupSize),
  }));
  const suppressedCount = marked.filter((g) => g.suppressed).length;
  if (suppressedCount !== 1) return marked;

  const visible = marked.filter((g) => !g.suppressed);
  if (visible.length === 0) return marked;
  let smallest = visible[0];
  for (const g of visible) if (g.count < smallest.count) smallest = g;
  smallest.suppressed = true;
  return marked;
}
