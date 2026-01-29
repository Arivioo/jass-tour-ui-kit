// Re-export Player type from hooks for backwards compatibility
export type { Player } from '@/hooks/usePlayers';

export const LOCATIONS = [
  { id: 'rechte-winkel', name: 'Rechte Winkel' },
  { id: 'huertel', name: 'Hürtel' },
  { id: 'engel', name: 'Engel' },
  { id: 'roessli', name: 'Rössli' },
  { id: 'poep', name: 'Pöp' },
  { id: 'custom', name: 'Manuell' },
] as const;

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
