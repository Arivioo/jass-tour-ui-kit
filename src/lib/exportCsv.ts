function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface SessionExportRow {
  date: string;
  location: string;
  winner: string;
  totalPot: number;
  players: { name: string; rank: number; wins: number; totalFines: number }[];
}

export function exportSessionsCsv(sessions: SessionExportRow[]) {
  const header = 'Datum;Ort;Gewinner;Pot;1. Platz;2. Platz;3. Platz;4. Platz';
  const rows = sessions.map(s => {
    const sorted = [...s.players].sort((a, b) => a.rank - b.rank);
    return [
      s.date,
      s.location,
      s.winner,
      s.totalPot,
      ...sorted.map(p => `${p.name} (${p.wins}S / ${p.totalFines} Bussen)`),
    ].join(';');
  });
  downloadCsv('jass-sessions.csv', [header, ...rows].join('\n'));
}

interface RankingExportRow {
  name: string;
  sessions: number;
  wins: number;
  avgRank: number;
  totalFines: number;
}

export function exportRankingsCsv(rankings: RankingExportRow[]) {
  const header = 'Spieler;Sessions;Siege;Durchschn. Rang;Total Bussen';
  const rows = rankings.map(r =>
    [r.name, r.sessions, r.wins, r.avgRank.toFixed(2), r.totalFines].join(';')
  );
  downloadCsv('jass-rangliste.csv', [header, ...rows].join('\n'));
}
