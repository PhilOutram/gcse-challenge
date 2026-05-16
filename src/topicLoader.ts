import type { Topic } from './types';

export interface ManifestEntry {
  file: string;
  id: string;
  subject: string;
  level: string;
  topic: string;
  questionCount: number;
}

export async function fetchManifest(): Promise<ManifestEntry[]> {
  const r = await fetch('/topics/manifest.json');
  if (!r.ok) throw new Error(`Failed to load manifest: ${r.status}`);
  return (await r.json()) as ManifestEntry[];
}

export async function loadTopic(file: string): Promise<Topic> {
  const r = await fetch('/topics/' + file);
  if (!r.ok) throw new Error(`Failed to load topic ${file}: ${r.status}`);
  return (await r.json()) as Topic;
}
