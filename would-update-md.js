#!/usr/bin/env node
// would-update-md.js — call Ollama → update -ISSUE-v1.md then -ASSET-v1.md via GitHub API
// Usage: node would-read-md.js | node would-update-md.js

const OLLAMA_URL   = process.env.OLLAMA_URL   || 'https://local.toigroup.co.nz';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'jayreck996';
const GITHUB_REPO  = 'gs-anz';
const ANCHOR = '####### <!-- ANCHOR MARKER - ADD ALL NEW ASSET ENTRIES DIRECTLY BELOW THIS LINE, NEVER DELETE OR EDIT PREVIOUS ASSET ENTRIES-->';

async function readStdin() {
  return new Promise(resolve => {
    let data = '';
    process.stdin.on('data', c => data += c);
    process.stdin.on('end', () => resolve(data.trim()));
  });
}

function nzTimestamp() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
}

async function callOllama(prompt) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
    signal: AbortSignal.timeout(180_000)
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  return (await res.json()).response.trim();
}

async function githubGet(path) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    { headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' } }
  );
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status}`);
  const data = await res.json();
  return { sha: data.sha, content: Buffer.from(data.content, 'base64').toString('utf8') };
}

async function githubPut(path, sha, content, message) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message, sha,
        content: Buffer.from(content).toString('base64'),
        committer: { name: 'gs-anz', email: 'jayreck996@gmail.com' }
      })
    }
  );
  if (!res.ok) throw new Error(`GitHub PUT ${path} failed: ${res.status} ${await res.text()}`);
}

function insertEntry(fileContent, entry) {
  const idx = fileContent.indexOf(ANCHOR);
  if (idx === -1) throw new Error('Anchor marker not found');
  const at = idx + ANCHOR.length;
  return fileContent.slice(0, at) + '\n' + entry + '\n' + fileContent.slice(at);
}

async function main() {
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not set');

  const news = await readStdin();
  if (!news) throw new Error('No news context on stdin — pipe output of would-read-md.js');

  const ts = nzTimestamp();
  console.log(`📅 ${ts} | ${news.split('\n').length} lines of news context`);

  // ── ISSUE ──────────────────────────────────────────────────────────────
  console.log('\n🤖 Ollama → ISSUE analysis...');
  const issueAnalysis = await callOllama(
    `You are a financial risk analyst. Based on the NZ interest rate news below, identify:\n` +
    `- Any rate changes or expected changes\n` +
    `- Key risks or concerns for borrowers, investors, or the economy\n` +
    `- Any urgent action signals\n\n` +
    `Format your response as 3-5 short bullet points using "- " prefix. Keep each bullet to one line. No intro sentence.\n\n` +
    news
  );
  console.log(issueAnalysis);

  const issueFile = await githubGet('-ISSUE-v1.md');
  await githubPut(
    '-ISSUE-v1.md', issueFile.sha,
    insertEntry(issueFile.content, `## ISSUE:ANZ ${ts}\n${issueAnalysis}`),
    `would-update: issue ${ts}`
  );
  console.log('✅ -ISSUE-v1.md updated');

  // ── ASSET ──────────────────────────────────────────────────────────────
  console.log('\n🤖 Ollama → ASSET analysis...');
  const assetAnalysis = await callOllama(
    `You are a financial asset analyst. Based on the NZ interest rate news below, summarize:\n` +
    `- Current OCR or rate level if mentioned\n` +
    `- What this means for each asset class: property, bonds, equities, savings\n` +
    `- Any opportunity or positioning signal\n\n` +
    `Format your response as 3-5 short bullet points using "- " prefix. Keep each bullet to one line. No intro sentence.\n\n` +
    news
  );
  console.log(assetAnalysis);

  const assetFile = await githubGet('-ASSET-v1.md');
  await githubPut(
    '-ASSET-v1.md', assetFile.sha,
    insertEntry(assetFile.content, `## ASSET:ANZ ${ts}\n${assetAnalysis}`),
    `would-update: asset ${ts}`
  );
  console.log('✅ -ASSET-v1.md updated');

  console.log('\n✅ Done');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
