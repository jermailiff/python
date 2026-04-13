import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityTimeline } from './components/ActivityTimeline';
import { CheckpointModal } from './components/CheckpointModal';
import { DailyLogView } from './components/DailyLogView';
import { HomeScreen } from './components/HomeScreen';
import { ThreadDetail } from './components/ThreadDetail';
import { db } from './lib/data/db';
import { seedIfEmpty } from './lib/data/seed';
import type { ActivityEvent, Artifact, ReentryPacket, Thread } from './lib/models/types';
import { LocalStubLlmProvider } from './lib/providers/llmProvider';
import { computeResumeScore } from './lib/scoring/resumeScore';
import { applyInferredThreadAssignments, inferThreadForEvent } from './lib/services/activityIntelligence';
import { MockActivityCaptureAdapter } from './lib/services/activityCapture';
import { buildDailyDigest } from './lib/services/digestService';
import { buildDailyLog, type DailyLogViewModel } from './lib/services/dailyLogService';
import { buildReentryPacket } from './lib/services/reentryService';
import { ThreadService } from './lib/services/threadService';

const llm = new LocalStubLlmProvider();
const threadService = new ThreadService(llm);

export default function App() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [packet, setPacket] = useState<ReentryPacket | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [checkpointOpen, setCheckpointOpen] = useState(false);
  const [digest, setDigest] = useState<string[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyLogViewModel | null>(null);

  const threadsRef = useRef<Thread[]>([]);
  const artifactsRef = useRef<Artifact[]>([]);

  const inferAndPersistEvents = async (rawEvents: ActivityEvent[], loadedThreads: Thread[], loadedArtifacts: Artifact[]) => {
    const inferredEvents = applyInferredThreadAssignments(rawEvents, loadedThreads, loadedArtifacts);
    const changedEvents = inferredEvents.filter((event, index) => {
      const original = rawEvents[index];
      return original.suggested_thread_id !== event.suggested_thread_id;
    });

    if (changedEvents.length > 0) {
      await Promise.all(changedEvents.map((event) => db.putActivityEvent(event)));
    }

    return inferredEvents;
  };

  const refreshCoreViews = async () => {
    const loadedThreads = (await db.listThreads()).sort((a, b) => b.last_touched_at.localeCompare(a.last_touched_at));
    const loadedEvents = await db.listActivityEvents();
    const loadedArtifacts = await db.listArtifacts();

    threadsRef.current = loadedThreads;
    artifactsRef.current = loadedArtifacts;

    const inferredEvents = await inferAndPersistEvents(loadedEvents, loadedThreads, loadedArtifacts);

    setThreads(loadedThreads);
    setEvents(inferredEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    setDigest(await buildDailyDigest(llm));
    setDailyLog(await buildDailyLog());
  };

  useEffect(() => {
    async function boot() {
      await seedIfEmpty();
      await refreshCoreViews();
    }
    void boot();

    const capture = new MockActivityCaptureAdapter();
    capture.start(async (event) => {
      const suggestedThreadId = inferThreadForEvent(event, threadsRef.current, artifactsRef.current);
      const inferredEvent: ActivityEvent = { ...event, suggested_thread_id: suggestedThreadId };
      await db.putActivityEvent(inferredEvent);
      setEvents((prev) => [inferredEvent, ...prev].sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
      setDailyLog(await buildDailyLog());
    });

    const onHotkey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCheckpointOpen(true);
      }
    };
    window.addEventListener('keydown', onHotkey);

    return () => {
      capture.stop();
      window.removeEventListener('keydown', onHotkey);
    };
  }, []);

  useEffect(() => {
    if (!selectedThreadId) return;
    void buildReentryPacket(selectedThreadId).then(setPacket);
  }, [selectedThreadId]);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [threads, selectedThreadId]
  );

  return (
    <main style={{ fontFamily: 'Inter, sans-serif', padding: 16, maxWidth: 1000 }}>
      <h1>Breadcrumbs</h1>
      <p>Local-first continuity layer for interruption recovery.</p>

      <button onClick={() => setCheckpointOpen(true)}>Capture checkpoint (⌘/Ctrl+Shift+K)</button>

      <CheckpointModal
        open={checkpointOpen}
        threads={threads}
        onClose={() => setCheckpointOpen(false)}
        onSave={async (threadId, note, nextStep, blocker) => {
          await threadService.createCheckpoint(threadId, note, nextStep, blocker);
          await refreshCoreViews();
          setCheckpointOpen(false);

          const suggested = await threadService.suggestThreadFromText(note);
          if (suggested && !selectedThreadId) setSelectedThreadId(suggested.id);
        }}
      />

      <HomeScreen threads={threads} onSelectThread={setSelectedThreadId} />

      {selectedThread && <ThreadDetail thread={selectedThread} packet={packet} />}

      <h3>Daily digest</h3>
      <ul>{digest.map((line) => <li key={line}>{line}</li>)}</ul>

      <h3>Resume scores</h3>
      <ul>
        {threads.map((thread) => (
          <li key={thread.id}>
            {thread.title}: {computeResumeScore(thread, null, 3, 3)} / 100
          </li>
        ))}
      </ul>

      <DailyLogView log={dailyLog} />

      <ActivityTimeline events={events} />
    </main>
  );
}
