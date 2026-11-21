// Hook Stop: nie pozwala Claude skończyć pracy z czerwonymi testami.
// Nic nie robi, gdy katalog nie jest repozytorium git, nie ma niezatwierdzonych
// zmian albo projekt nie ma skryptu "test" w package.json. W przeciwnym razie
// uruchamia npm test; jeśli testy padają, kończy się kodem 2 i wypisuje na stderr,
// które testy nie przeszły (Claude Code przekazuje stderr z powrotem Claude).

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function wczytajJson(sciezkaLubFd) {
  try {
    return JSON.parse(readFileSync(sciezkaLubFd, 'utf8'));
  } catch {
    return null;
  }
}

const wejscie = wczytajJson(0) ?? {};
const katalog = process.env.CLAUDE_PROJECT_DIR || wejscie.cwd || process.cwd();

const git = spawnSync('git', ['status', '--porcelain'], { cwd: katalog, encoding: 'utf8' });
if (git.status !== 0 || git.stdout.trim() === '') {
  process.exit(0);
}

// Bez skryptu "test" (albo z domyślnym z npm init) nie ma czego pilnować.
const skryptTestu = wczytajJson(join(katalog, 'package.json'))?.scripts?.test;
if (!skryptTestu || /no test specified/.test(skryptTestu)) {
  process.exit(0);
}

// Reporter TAP dodajemy tylko dla node --test; inne narzędzia mogłyby nie znać tej flagi.
const polecenie = /\bnode\b.*--test\b/.test(skryptTestu)
  ? 'npm test -- --test-reporter=tap'
  : 'npm test';

const test = spawnSync(polecenie, {
  cwd: katalog,
  encoding: 'utf8',
  shell: true,
  maxBuffer: 20 * 1024 * 1024,
});

if (test.status === 0) {
  process.exit(0);
}

// Z wyjścia TAP wyciągamy "not ok N - nazwa" i pierwszą linię "error:" pod nią.
const linie = `${test.stdout}\n${test.stderr}`.split(/\r?\n/);
const padly = [];
for (let i = 0; i < linie.length; i++) {
  const m = linie[i].match(/^(\s*)not ok \d+ - (.+)$/);
  if (!m) continue;
  let blad = '';
  for (let j = i + 1; j < linie.length && !/^\s*(ok|not ok) \d+/.test(linie[j]); j++) {
    const e = linie[j].match(/^\s*error:\s*(.+)$/);
    if (e) {
      blad = e[1].replace(/^['|>-]+\s*|'$/g, '').trim();
      if (!blad && linie[j + 1]) blad = linie[j + 1].trim();
      break;
    }
  }
  padly.push(`${m[1]}- ${m[2]}${blad ? ` → ${blad}` : ''}`);
}

// Gdy wyjście nie jest w TAP, pokazujemy ostatnie linie logu.
const raport = padly.length
  ? padly.join('\n')
  : linie.filter(Boolean).slice(-30).join('\n');

process.stderr.write(
  `Bramka testów: w repozytorium są niezatwierdzone zmiany, a npm test nie przechodzi. ` +
    `Nie kończ pracy, napraw te testy:\n${raport}\n`
);
process.exit(2);
