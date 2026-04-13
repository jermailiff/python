import type { ReentryPacket, Thread } from '../lib/models/types';

interface Props {
  thread: Thread;
  packet: ReentryPacket | null;
}

export function ThreadDetail({ thread, packet }: Props) {
  if (!packet) return <p>Loading packet...</p>;

  return (
    <section>
      <h2>{thread.title}</h2>
      <p><strong>Resume now:</strong> {packet.suggestedAction}</p>
      <ul>
        {packet.threeLineSummary.map((line) => <li key={line}>{line}</li>)}
      </ul>
      <p><strong>Latest checkpoint:</strong> {packet.latestCheckpoint?.summary ?? 'None'}</p>
      <p><strong>Next step:</strong> {packet.nextStep}</p>
      <p><strong>Blocker:</strong> {packet.blocker ?? 'None'}</p>

      <h3>Recent tools</h3>
      <ul>{packet.recentTools.map((tool) => <li key={tool}>{tool}</li>)}</ul>

      <h3>Recent browser tabs</h3>
      <ul>{packet.recentTabs.map((tab) => <li key={tab.id}><a href={tab.value}>{tab.title}</a></li>)}</ul>

      <h3>Recent files</h3>
      <ul>{packet.recentFiles.map((file) => <li key={file.id}>{file.value}</li>)}</ul>
    </section>
  );
}
