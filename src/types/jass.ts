export interface Fine {
  id: string;
  playerId: string;
  type: string;
  amount: number;
  note?: string;
  matchNumber?: number;
  location?: string;
}

export interface MatchResult {
  teamA: string[];
  teamB: string[];
  teamATotal: number;
  teamBTotal: number;
  winner: 'A' | 'B' | 'tie';
  fines: Fine[];
  location: string;
  matchNumber: number;
}

export interface PlayerWins {
  [playerId: string]: number;
}

export interface RankingPlayer {
  playerId: string;
  name: string;
  wins: number;
  rank: number;
}
