import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeEvent =
  | { type: 'score:update'; teamA: number[]; teamB: number[] }
  | { type: 'fine:add'; fine: { id: string; playerId: string; fineType: string; amount: number; note?: string } }
  | { type: 'fine:remove'; fineId: string }
  | { type: 'match:complete'; matchNumber: number; winner: 'A' | 'B' | 'tie' }
  | { type: 'session:start' }
  | { type: 'step:change'; step: string }
  | { type: 'teams:set'; teamA: string[]; teamB: string[] };

export function createSessionChannel(sessionId: string): RealtimeChannel {
  return supabase.channel(`session:${sessionId}`);
}

export function broadcastEvent(channel: RealtimeChannel, event: RealtimeEvent) {
  channel.send({
    type: 'broadcast',
    event: 'session_event',
    payload: event,
  });
}

export function onSessionEvent(
  channel: RealtimeChannel,
  handler: (event: RealtimeEvent) => void,
) {
  channel.on('broadcast', { event: 'session_event' }, ({ payload }) => {
    handler(payload as RealtimeEvent);
  });
}

export function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
