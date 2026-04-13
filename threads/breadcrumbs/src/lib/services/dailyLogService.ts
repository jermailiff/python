import { db } from '../data/db';
import type { ActivityEvent } from '../models/types';
import { computeResumeScore } from '../scoring/resumeScore';
import { applyInferredThreadAssignments, detectContextSwitches } from './activityIntelligence';

export interface DailyThreadSummary {
  threadId: string;
  title: string;
  activityCount: number;
  lastSeenAt: string;
  suggestedResumeAction: string;
  resumeScore: number;
}

export interface DailyLogViewModel {
  date: string;
  events: ActivityEvent[];
  contextSwitches: ReturnType<typeof detectContextSwitches>;
  threadSummaries: DailyThreadSummary[];
}

export async function buildDailyLog(date = new Date()): Promise<DailyLogViewModel> {
  const threads = await db.listThreads();
  const artifacts = await db.listArtifacts();
  const checkpoints = await db.listCheckpoints();
  const events = await db.listActivityEvents();

  const dayKey = date.toISOString().slice(0, 10);
  const dayEvents = events.filter((event) => event.timestamp.startsWith(dayKey));
  const inferredEvents = applyInferredThreadAssignments(dayEvents, threads, artifacts);
  const contextSwitches = detectContextSwitches(inferredEvents);

  const threadSummaries = threads
    .map((thread) => {
      const relatedEvents = inferredEvents.filter(
        (event) => (event.confirmed_thread_id || event.suggested_thread_id) === thread.id
      );

      if (relatedEvents.length === 0) return null;
      const lastCheckpoint = checkpoints
        .filter((checkpoint) => checkpoint.thread_id === thread.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] || null;

      return {
        threadId: thread.id,
        title: thread.title,
        activityCount: relatedEvents.length,
        lastSeenAt: relatedEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0].timestamp,
        suggestedResumeAction: lastCheckpoint?.next_step || thread.next_step,
        resumeScore: computeResumeScore(
          thread,
          lastCheckpoint,
          artifacts.filter((artifact) => artifact.thread_id === thread.id).length,
          relatedEvents.length
        )
      };
    })
    .filter((summary): summary is DailyThreadSummary => Boolean(summary))
    .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));

  return {
    date: dayKey,
    events: inferredEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    contextSwitches,
    threadSummaries
  };
}
