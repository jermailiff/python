import { db } from '../data/db';
import type { ReentryPacket } from '../models/types';

export async function buildReentryPacket(threadId: string): Promise<ReentryPacket | null> {
  const threads = await db.listThreads();
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return null;

  const checkpoints = (await db.listCheckpoints(threadId)).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const artifacts = (await db.listArtifacts(threadId)).sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at));
  const events = (await db.listActivityEvents(threadId)).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return {
    threeLineSummary: [
      thread.summary,
      `Last touched ${new Date(thread.last_touched_at).toLocaleString()}`,
      `Status: ${thread.status}`
    ],
    latestCheckpoint: checkpoints[0] ?? null,
    nextStep: thread.next_step,
    blocker: thread.blocker,
    recentTools: [...new Set(events.map((e) => e.app_name))].slice(0, 5),
    recentArtifacts: artifacts.slice(0, 8),
    recentTabs: artifacts.filter((a) => a.type === 'url' || a.type === 'browser_tab').slice(0, 5),
    recentFiles: artifacts.filter((a) => a.type === 'file').slice(0, 5),
    suggestedAction: checkpoints[0]?.next_step || thread.next_step
  };
}
