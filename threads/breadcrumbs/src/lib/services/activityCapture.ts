import type { ActivityEvent } from '../models/types';

export interface ActivityCaptureAdapter {
  start(onEvent: (event: ActivityEvent) => void): void;
  stop(): void;
}

/**
 * Development adapter that simulates passive capture every 15s.
 * Production collectors should replace this with OS/browser integrations.
 */
export class MockActivityCaptureAdapter implements ActivityCaptureAdapter {
  private timer: number | null = null;

  start(onEvent: (event: ActivityEvent) => void): void {
    this.timer = window.setInterval(() => {
      const event: ActivityEvent = {
        id: crypto.randomUUID(),
        app_name: document.visibilityState === 'visible' ? 'Breadcrumbs' : 'Unknown',
        window_title: document.title,
        url: window.location.href,
        file_path: null,
        timestamp: new Date().toISOString(),
        suggested_thread_id: null,
        confirmed_thread_id: null
      };
      onEvent(event);
    }, 15000);
  }

  stop(): void {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }
}
