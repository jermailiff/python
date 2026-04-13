import { db } from '../data/db';
import type { LlmProvider } from '../providers/llmProvider';

export async function buildDailyDigest(llm: LlmProvider): Promise<string[]> {
  const threads = await db.listThreads();
  const checkpoints = await db.listCheckpoints();

  const moved = threads.filter((t) => Date.now() - new Date(t.last_touched_at).getTime() < 8 * 60 * 60 * 1000);
  const stalled = threads.filter((t) => Date.now() - new Date(t.last_touched_at).getTime() > 24 * 60 * 60 * 1000);
  const orphaned = threads.filter((t) => !checkpoints.some((c) => c.thread_id === t.id));

  const lines = [
    `Moved today: ${moved.map((t) => t.title).join(', ') || 'none'}`,
    `Stalled: ${stalled.map((t) => t.title).join(', ') || 'none'}`,
    `Orphaned threads: ${orphaned.map((t) => t.title).join(', ') || 'none'}`,
    `Suggested next action: ${threads.find((t) => t.status === 'now')?.next_step || 'Pick one thread and checkpoint it.'}`
  ];

  return llm.summarizeDailyDigest(lines);
}
