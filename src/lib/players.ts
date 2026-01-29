// Placeholder player data for 4 fixed players
export interface Player {
  id: string;
  name: string;
  avatar?: string;
}

export const PLAYERS: Player[] = [
  { id: '1', name: 'Hans' },
  { id: '2', name: 'Peter' },
  { id: '3', name: 'Urs' },
  { id: '4', name: 'Beat' },
];

export const FINE_TYPES = [
  { id: 'eichle', label: 'Eichle Banner', amount: 5 },
  { id: 'match', label: 'Match', amount: 10 },
  { id: 'weniger', label: 'Weniger Punkte', amount: 5 },
  { id: 'gliichi4', label: '4 Gliichi', amount: 5 },
  { id: 'gliichi4plus', label: '4 Gliichi (doppelt)', amount: 10 },
  { id: 'charte', label: 'Charte Lüpfe', amount: 5 },
  { id: 'spezial', label: 'Spezielle Busse', amount: 0 },
] as const;

export function formatCHF(amount: number): string {
  return `CHF ${amount}.–`;
}
