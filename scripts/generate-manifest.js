import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOPICS_DIR = resolve(__dirname, '..', 'public', 'topics');
const MANIFEST_PATH = join(TOPICS_DIR, 'manifest.json');
const MANIFEST_NAME = 'manifest.json';

const files = readdirSync(TOPICS_DIR)
  .filter(f => f.endsWith('.json') && f !== MANIFEST_NAME)
  .sort();

const entries = files.map(file => {
  const raw = readFileSync(join(TOPICS_DIR, file), 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${file}: ${err.message}`);
  }
  for (const key of ['subject', 'level', 'topic', 'questions']) {
    if (data[key] === undefined) {
      throw new Error(`Missing "${key}" in ${file}`);
    }
  }
  if (!Array.isArray(data.questions)) {
    throw new Error(`"questions" must be an array in ${file}`);
  }
  return {
    file,
    id: data.id ?? file.replace(/\.json$/, ''),
    subject: data.subject,
    level: data.level,
    topic: data.topic,
    questionCount: data.questions.length,
  };
});

writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2) + '\n', 'utf8');
console.log(`Wrote ${MANIFEST_PATH} (${entries.length} topics)`);
