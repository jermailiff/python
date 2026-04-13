import { db } from './db';
import type { ActivityEvent, Artifact, Checkpoint, Thread } from '../models/types';

const now = new Date();
const iso = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60000).toISOString();

const threads: Thread[] = [
  {
    id: 'thread-la-ads',
    title: 'LA private offices ads',
    status: 'now',
    summary: 'Dialing Meta ads targeting founders in LA who need private office space.',
    next_step: 'Ship variant B creative and compare CPL after 48h.',
    blocker: null,
    created_at: iso(3000),
    updated_at: iso(22),
    last_touched_at: iso(7)
  },
  {
    id: 'thread-fundraising',
    title: 'Fundraising outreach',
    status: 'next',
    summary: 'Rolling update + ask emails for 12 angels and 4 micro-VCs.',
    next_step: 'Finalize June metrics paragraph before sending batch #2.',
    blocker: 'Waiting on corrected churn metric from finance sheet.',
    created_at: iso(4400),
    updated_at: iso(180),
    last_touched_at: iso(85)
  },
  {
    id: 'thread-echo-ops',
    title: 'Echo Park ops issue',
    status: 'blocked',
    summary: 'Recurring access control outage at Echo Park location.',
    next_step: 'Escalate with vendor and attach 3 outage timestamps.',
    blocker: 'Vendor support ticket has no owner assigned yet.',
    created_at: iso(1900),
    updated_at: iso(60),
    last_touched_at: iso(60)
  }
];

const checkpoints: Checkpoint[] = [
  {
    id: 'cp-1',
    thread_id: 'thread-la-ads',
    raw_note: 'In Ads Manager setting audience exclusions. Need to avoid current tenants + job seekers.',
    summary: 'Audience cleanup in Ads Manager to reduce noise leads.',
    next_step: 'Export current tenant list CSV and apply exclusion audience.',
    blocker: null,
    created_at: iso(9)
  },
  {
    id: 'cp-2',
    thread_id: 'thread-fundraising',
    raw_note: 'Drafted almost all investor updates, metrics section still wrong.',
    summary: 'Fundraising email draft is done except key KPI corrections.',
    next_step: 'Get corrected churn metric from sheet and send 16 emails.',
    blocker: 'Data mismatch between Stripe and finance sheet.',
    created_at: iso(90)
  }
];

const events: ActivityEvent[] = [
  {
    id: 'ev-1',
    app_name: 'Google Chrome',
    window_title: 'Meta Ads Manager - Breadcrumbs LA Campaign',
    url: 'https://business.facebook.com/adsmanager',
    file_path: null,
    timestamp: iso(7),
    suggested_thread_id: 'thread-la-ads',
    confirmed_thread_id: 'thread-la-ads'
  },
  {
    id: 'ev-2',
    app_name: 'Slack',
    window_title: 'ops-echo-park | outage follow-ups',
    url: null,
    file_path: null,
    timestamp: iso(59),
    suggested_thread_id: 'thread-echo-ops',
    confirmed_thread_id: 'thread-echo-ops'
  }
];

const artifacts: Artifact[] = [
  {
    id: 'ar-1',
    thread_id: 'thread-la-ads',
    type: 'url',
    value: 'https://business.facebook.com/adsmanager',
    title: 'Meta Ads Manager',
    last_seen_at: iso(7)
  },
  {
    id: 'ar-2',
    thread_id: 'thread-fundraising',
    type: 'file',
    value: '/Users/founder/Documents/fundraising/June_Update.md',
    title: 'June_Update.md',
    last_seen_at: iso(88)
  },
  {
    id: 'ar-3',
    thread_id: 'thread-echo-ops',
    type: 'slack_link',
    value: 'https://workspace.slack.com/archives/C12345/p12345',
    title: 'Echo Park outage thread',
    last_seen_at: iso(62)
  }
];

export async function seedIfEmpty() {
  const existingThreads = await db.listThreads();
  if (existingThreads.length > 0) {
    return;
  }
  await Promise.all(threads.map((t) => db.putThread(t)));
  await Promise.all(checkpoints.map((c) => db.putCheckpoint(c)));
  await Promise.all(events.map((e) => db.putActivityEvent(e)));
  await Promise.all(artifacts.map((a) => db.putArtifact(a)));
}
