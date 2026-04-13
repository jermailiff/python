import { useState } from 'react';
import type { Thread } from '../lib/models/types';

interface Props {
  open: boolean;
  threads: Thread[];
  onSave: (threadId: string, note: string, nextStep: string, blocker: string) => Promise<void>;
  onClose: () => void;
}

export function CheckpointModal({ open, threads, onSave, onClose }: Props) {
  const [threadId, setThreadId] = useState<string>('');
  const [note, setNote] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [blocker, setBlocker] = useState('');

  if (!open) return null;

  return (
    <div style={{ border: '1px solid #666', padding: 12, margin: 12 }}>
      <h3>Quick checkpoint</h3>
      <select value={threadId} onChange={(e) => setThreadId(e.target.value)}>
        <option value="">Select thread</option>
        {threads.map((thread) => (
          <option key={thread.id} value={thread.id}>{thread.title}</option>
        ))}
      </select>
      <input placeholder="What were you doing?" value={note} onChange={(e) => setNote(e.target.value)} />
      <input placeholder="What is the next step?" value={nextStep} onChange={(e) => setNextStep(e.target.value)} />
      <input placeholder="Anything blocking you?" value={blocker} onChange={(e) => setBlocker(e.target.value)} />
      <button disabled={!threadId || !note || !nextStep} onClick={async () => {
        await onSave(threadId, note, nextStep, blocker);
        setThreadId(''); setNote(''); setNextStep(''); setBlocker('');
      }}>Save in under 5s</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
