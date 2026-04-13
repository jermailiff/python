export type ThreadStatus = 'now' | 'next' | 'later' | 'blocked' | 'done';

export interface Thread {
  id: string;
  title: string;
  status: ThreadStatus;
  summary: string;
  next_step: string;
  blocker: string | null;
  created_at: string;
  updated_at: string;
  last_touched_at: string;
}

export interface Checkpoint {
  id: string;
  thread_id: string;
  raw_note: string;
  summary: string;
  next_step: string;
  blocker: string | null;
  created_at: string;
}

export interface ActivityEvent {
  id: string;
  app_name: string;
  window_title: string;
  url: string | null;
  file_path: string | null;
  timestamp: string;
  suggested_thread_id: string | null;
  confirmed_thread_id: string | null;
}

export type ArtifactType = 'url' | 'file' | 'note' | 'slack_link' | 'browser_tab';

export interface Artifact {
  id: string;
  thread_id: string;
  type: ArtifactType;
  value: string;
  title: string;
  last_seen_at: string;
}

export interface ReentryPacket {
  threeLineSummary: string[];
  latestCheckpoint: Checkpoint | null;
  nextStep: string;
  blocker: string | null;
  recentTools: string[];
  recentArtifacts: Artifact[];
  recentTabs: Artifact[];
  recentFiles: Artifact[];
  suggestedAction: string;
}
