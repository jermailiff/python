import type { ActivityEvent } from '../lib/models/types';

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  return (
    <section>
      <h3>Activity timeline</h3>
      <ul>
        {events.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 20).map((event) => (
          <li key={event.id}>
            [{new Date(event.timestamp).toLocaleTimeString()}] {event.app_name} — {event.window_title}
          </li>
        ))}
      </ul>
    </section>
  );
}
