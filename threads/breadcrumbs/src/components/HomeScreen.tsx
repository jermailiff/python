import type { Thread } from '../lib/models/types';

interface Props {
  threads: Thread[];
  onSelectThread: (threadId: string) => void;
}

export function HomeScreen({ threads, onSelectThread }: Props) {
  const nowThread = threads.find((t) => t.status === 'now');
  const noCheckpoint = threads.filter((t) => !t.next_step);
  const atRisk = threads.filter((t) => Date.now() - new Date(t.last_touched_at).getTime() > 12 * 60 * 60 * 1000);

  return (
    <section>
      <h2>Continue where you left off</h2>
      {nowThread ? <button onClick={() => onSelectThread(nowThread.id)}>{nowThread.title}</button> : <p>No active now thread.</p>}

      <h3>Recent threads</h3>
      <ul>
        {threads.slice(0, 6).map((thread) => (
          <li key={thread.id}>
            <button onClick={() => onSelectThread(thread.id)}>{thread.title}</button>
          </li>
        ))}
      </ul>

      <h3>Threads with no checkpoint</h3>
      <p>{noCheckpoint.length || 0}</p>

      <h3>Threads at risk of being dropped</h3>
      <p>{atRisk.length || 0}</p>

      {threads.filter((t) => t.status !== 'done').length > 6 && <p>⚠️ Too many active threads. Close or park some.</p>}
    </section>
  );
}
