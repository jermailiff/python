import type { DailyLogViewModel } from '../lib/services/dailyLogService';

export function DailyLogView({ log }: { log: DailyLogViewModel | null }) {
  if (!log) return <p>Loading daily log...</p>;

  const topResume = [...log.threadSummaries].sort((a, b) => a.resumeScore - b.resumeScore).slice(0, 3);

  return (
    <section>
      <h3>Daily log ({log.date})</h3>
      <p>Likely context switches: {log.contextSwitches.length}</p>
      {log.contextSwitches.length === 0 ? (
        <p>No major switches detected yet today.</p>
      ) : (
        <ul>
          {log.contextSwitches.slice(0, 10).map((item) => (
            <li key={item.id}>
              [{new Date(item.at).toLocaleTimeString()}] {item.reason}
            </li>
          ))}
        </ul>
      )}

      <h4>Needs easiest re-entry help now</h4>
      {topResume.length === 0 ? (
        <p>No active thread activity today yet.</p>
      ) : (
        <ul>
          {topResume.map((summary) => (
            <li key={summary.threadId}>
              <strong>{summary.title}</strong> — next: {summary.suggestedResumeAction} (resume score {summary.resumeScore})
            </li>
          ))}
        </ul>
      )}

      <h4>Captured events today</h4>
      <ul>
        {log.events.slice(0, 25).map((event) => (
          <li key={event.id}>
            [{new Date(event.timestamp).toLocaleTimeString()}] {event.app_name} — {event.window_title}
            {event.suggested_thread_id ? ` → ${event.suggested_thread_id}` : ''}
          </li>
        ))}
      </ul>
    </section>
  );
}
