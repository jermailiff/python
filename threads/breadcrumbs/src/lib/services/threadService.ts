import { db } from '../data/db';
import type { Checkpoint, Thread } from '../models/types';
import type { LlmProvider } from '../providers/llmProvider';

export class ThreadService {
  constructor(private readonly llm: LlmProvider) {}

  async createCheckpoint(threadId: string, rawNote: string, nextStep: string, blocker?: string) {
    const checkpoint: Checkpoint = {
      id: crypto.randomUUID(),
      thread_id: threadId,
      raw_note: rawNote,
      summary: rawNote.slice(0, 120),
      next_step: nextStep,
      blocker: blocker || null,
      created_at: new Date().toISOString()
    };
    await db.putCheckpoint(checkpoint);

    const threads = await db.listThreads();
    const thread = threads.find((t) => t.id === threadId);
    if (thread) {
      const updated: Thread = {
        ...thread,
        next_step: nextStep,
        blocker: blocker || null,
        updated_at: new Date().toISOString(),
        last_touched_at: new Date().toISOString()
      };
      await db.putThread(updated);
    }
    return checkpoint;
  }

  async suggestThreadFromText(rawText: string): Promise<Thread | null> {
    const threads = await db.listThreads();
    const suggestion = await this.llm.suggestThread({
      rawText,
      candidateThreadTitles: threads.map((t) => t.title)
    });
    return threads.find((t) => t.title === suggestion) ?? null;
  }
}
