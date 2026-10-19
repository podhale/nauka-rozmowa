// Validates /content and merges it into public/content/content.json (what the app loads).
// Usage: node scripts/build-content.mjs [--check]   (--check = validate only, exit 1 on errors)
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cardsDir = join(root, 'content', 'cards');
const cheatsDir = join(root, 'content', 'cheats');
const outFile = join(root, 'public', 'content', 'content.json');
const checkOnly = process.argv.includes('--check');

/** Display names that override the "name" field in the files. */
const NAMES = { data: 'EF Core i dostęp do danych' };
const LANGS = new Set(['csharp', 'typescript', 'html', 'sql', 'json', 'bash', 'text', 'yaml', 'dockerfile', 'css', 'javascript']);

const errors = [];
const warnings = [];
const readJson = (file) => {
  try { return JSON.parse(readFileSync(file, 'utf8')); }
  catch (e) { errors.push(`${file}: niepoprawny JSON (${e.message})`); return null; }
};
const jsonFiles = (dir) => readdirSync(dir).filter((f) => f.endsWith('.json')).sort();

// ---- cards & quiz: <cat>.json + optional <cat>-senior.json etc. are merged by "cat" ----
const cats = new Map();
const ids = new Set();
for (const f of jsonFiles(cardsDir)) {
  const x = readJson(join(cardsDir, f));
  if (!x) continue;
  if (!x.cat || !Array.isArray(x.cards) || !Array.isArray(x.quiz)) { errors.push(`${f}: brak pól cat/cards/quiz`); continue; }
  const c = cats.get(x.cat) ?? { cat: x.cat, name: NAMES[x.cat] ?? x.name, cards: [], quiz: [] };
  for (const card of x.cards) {
    const where = `${f} → ${card.id ?? '(bez id)'}`;
    if (!card.id || !card.q || !card.a || !card.topic) errors.push(`${where}: karta wymaga id, topic, q, a`);
    if (ids.has(card.id)) errors.push(`${where}: zduplikowane id`);
    ids.add(card.id);
    if (![1, 2, 3].includes(card.level)) errors.push(`${where}: level musi być 1, 2 albo 3`);
    if (card.lang && !LANGS.has(card.lang)) warnings.push(`${where}: nieznany lang "${card.lang}"`);
    if (card.code && !card.lang) warnings.push(`${where}: code bez lang`);
    c.cards.push(card);
  }
  for (const q of x.quiz) {
    const where = `${f} → ${q.id ?? '(bez id)'}`;
    if (!q.id || !q.q || !q.topic || !Array.isArray(q.options) || q.why === undefined) errors.push(`${where}: pytanie wymaga id, topic, q, options, why`);
    if (ids.has(q.id)) errors.push(`${where}: zduplikowane id`);
    ids.add(q.id);
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= (q.options?.length ?? 0)) errors.push(`${where}: correct poza zakresem`);
    if (new Set(q.options ?? []).size !== (q.options ?? []).length) warnings.push(`${where}: powtórzone opcje`);
    if (![1, 2, 3].includes(q.level)) errors.push(`${where}: level musi być 1, 2 albo 3`);
    c.quiz.push(q);
  }
  cats.set(x.cat, c);
}

// ---- cheat sheets: cheats[cat][topic] ----
const cheats = {};
for (const f of jsonFiles(cheatsDir)) {
  const x = readJson(join(cheatsDir, f));
  if (!x) continue;
  for (const s of x.sheets ?? []) {
    if (!s.topic || !Array.isArray(s.points) || !s.points.length) { errors.push(`${f}: ściąga bez topic/points`); continue; }
    const { topic, ...sheet } = s;
    cheats[x.cat] ??= {};
    if (cheats[x.cat][topic]) warnings.push(`${f}: ściąga "${topic}" zdefiniowana więcej niż raz (wygrywa ostatnia)`);
    cheats[x.cat][topic] = sheet;
  }
}
for (const c of cats.values()) {
  const topics = new Set([...c.cards, ...c.quiz].map((x) => x.topic));
  const missing = [...topics].filter((t) => !cheats[c.cat]?.[t]);
  if (missing.length) warnings.push(`${c.cat}: ${missing.length}/${topics.size} tematów bez ściągi (np. "${missing[0]}")`);
  const orphan = Object.keys(cheats[c.cat] ?? {}).filter((t) => !topics.has(t));
  if (orphan.length) warnings.push(`${c.cat}: ściągi bez pytań: ${orphan.slice(0, 3).join(', ')}`);
}

for (const w of warnings) console.warn('ostrzeżenie:', w);
if (errors.length) {
  for (const e of errors) console.error('BŁĄD:', e);
  console.error(`\n${errors.length} błędów — popraw pliki w /content.`);
  process.exit(1);
}

const all = [...cats.values()];
const total = (k) => all.reduce((a, c) => a + c[k].length, 0);
const sheetCount = Object.values(cheats).reduce((a, x) => a + Object.keys(x).length, 0);
console.log(`OK: ${all.length} obszarów, ${total('cards')} kart, ${total('quiz')} pytań, ${sheetCount} ściąg`);

if (!checkOnly) {
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify({ version: new Date().toISOString(), cats: all, cheats }));
  console.log('Zapisano', outFile);
}
