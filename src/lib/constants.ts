export const JASS = {
  MATCHES_PER_SESSION: 5,
  ROUNDS_PER_MATCH: 8,
  POINTS_PER_ROUND: 157,
  BUY_IN: 25,
  RANK_FINES: { 1: 0, 2: 10, 3: 15, 4: 20 } as Record<number, number>,
} as const;
