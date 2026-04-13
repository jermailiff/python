import type { ActivityEvent, Artifact, Thread } from '../models/types';

export interface ContextSwitch {
  id: string;
  fromEventId: string;
  toEventId: string;
  at: string;
  reason: string;
}

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3);

export function inferThreadForEvent(event: ActivityEvent, threads: Thread[], artifacts: Artifact[]): string | null {
  const context = [event.app_name, event.window_title, event.url, event.file_path].filter(Boolean).join(' ');
  const tokens = new Set(tokenize(context));

  let bestScore = 0;
  let bestThreadId: string | null = null;

  for (const thread of threads) {
    const threadTokens = tokenize(`${thread.title} ${thread.summary} ${thread.next_step}`);
    const threadArtifacts = artifacts.filter((artifact) => artifact.thread_id === thread.id);
    const artifactTokens = threadArtifacts.flatMap((artifact) => tokenize(`${artifact.title} ${artifact.value}`));

    let score = 0;
    for (const token of threadTokens) {
      if (tokens.has(token)) score += 2;
    }
    for (const token of artifactTokens) {
      if (tokens.has(token)) score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestThreadId = thread.id;
    }
  }

  return bestScore >= 2 ? bestThreadId : null;
}

export function applyInferredThreadAssignments(
  events: ActivityEvent[],
  threads: Thread[],
  artifacts: Artifact[]
): ActivityEvent[] {
  return events.map((event) => {
    if (event.confirmed_thread_id || event.suggested_thread_id) return event;
    return {
      ...event,
      suggested_thread_id: inferThreadForEvent(event, threads, artifacts)
    };
  });
}

export function detectContextSwitches(events: ActivityEvent[]): ContextSwitch[] {
  const ordered = [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const switches: ContextSwitch[] = [];

  for (let i = 1; i < ordered.length; i += 1) {
    const prev = ordered[i - 1];
    const curr = ordered[i];

    const appChanged = prev.app_name !== curr.app_name;
    const threadChanged = (prev.confirmed_thread_id || prev.suggested_thread_id) !== (curr.confirmed_thread_id || curr.suggested_thread_id);
    const gapMs = new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime();
    const longGap = gapMs > 8 * 60 * 1000;

    if (appChanged || threadChanged || longGap) {
      const reasons = [
        appChanged ? 'app change' : '',
        threadChanged ? 'thread change' : '',
        longGap ? 'long idle gap' : ''
      ].filter(Boolean);

      switches.push({
        id: `${prev.id}-${curr.id}`,
        fromEventId: prev.id,
        toEventId: curr.id,
        at: curr.timestamp,
        reason: reasons.join(', ')
      });
    }
  }

  return switches;
}
