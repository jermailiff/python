import { openDB } from 'idb';
import type { ActivityEvent, Artifact, Checkpoint, Thread } from '../models/types';

export const dbPromise = openDB('breadcrumbs-db', 1, {
  upgrade(db) {
    db.createObjectStore('threads', { keyPath: 'id' });
    db.createObjectStore('checkpoints', { keyPath: 'id' });
    db.createObjectStore('activityEvents', { keyPath: 'id' });
    db.createObjectStore('artifacts', { keyPath: 'id' });
  }
});

export const db = {
  async putThread(thread: Thread) {
    return (await dbPromise).put('threads', thread);
  },
  async listThreads(): Promise<Thread[]> {
    return (await dbPromise).getAll('threads');
  },
  async putCheckpoint(checkpoint: Checkpoint) {
    return (await dbPromise).put('checkpoints', checkpoint);
  },
  async listCheckpoints(threadId?: string): Promise<Checkpoint[]> {
    const rows = await (await dbPromise).getAll('checkpoints');
    return threadId ? rows.filter((row) => row.thread_id === threadId) : rows;
  },
  async putActivityEvent(event: ActivityEvent) {
    return (await dbPromise).put('activityEvents', event);
  },
  async listActivityEvents(threadId?: string): Promise<ActivityEvent[]> {
    const rows = await (await dbPromise).getAll('activityEvents');
    return threadId ? rows.filter((row) => row.confirmed_thread_id === threadId) : rows;
  },
  async putArtifact(artifact: Artifact) {
    return (await dbPromise).put('artifacts', artifact);
  },
  async listArtifacts(threadId?: string): Promise<Artifact[]> {
    const rows = await (await dbPromise).getAll('artifacts');
    return threadId ? rows.filter((row) => row.thread_id === threadId) : rows;
  }
};
