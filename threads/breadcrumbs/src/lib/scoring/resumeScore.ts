import type { Checkpoint, Thread } from '../models/types';

export function computeResumeScore(thread: Thread, checkpoint: Checkpoint | null, artifactCount: number, recentEventCount: number): number {
  let score = 100;
  const lastTouchedMinutes = (Date.now() - new Date(thread.last_touched_at).getTime()) / 60000;
  score -= Math.min(35, lastTouchedMinutes / 30);
  if (!checkpoint) score -= 20;
  if (!thread.next_step || thread.next_step.length < 10) score -= 15;
  if (artifactCount < 2) score -= 10;
  if (recentEventCount < 2) score -= 10;
  if (thread.blocker) score -= 10;
  return Math.max(0, Math.round(score));
}
