#!/usr/bin/env node
// would-update-docs.js — insert pre-computed analyses into GitHub files
// Usage: GITHUB_TOKEN=... ISSUE_ANALYSIS=... ASSET_ANALYSIS=... node would-update-docs.js

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const QUARTER = getCurrentQuarter(process.env.QUARTER_OVERRIDE);

function getCurrentQuarter(override) {
  if (override) return override;
  const now = new Date();
  return `${now.getFullYear()}Q${Math.ceil((now.getMonth() + 1) / 3)}`;
}

const GITHUB_OWNER = 'toiflow';
const GITHUB_REPO  = 'ts-anz';
const ANCHOR = '####### <!-- ANCHOR MARKER - ADD ALL NEW ASSET ENTRIES DIRECTLY BELOW THIS LINE, NEVER DELETE OR EDIT PREVIOUS ASSET ENTRIES-->';

const ISSUE_HEADER = `ISSUE LOG
INSTRUCTION FOR AI MODEL:

ALWAYS ADD NEW ISSUE ENTRIES AT THE TOP, DIRECTLY BELOW THIS HEADER.

NEVER DELETE OR EDIT PREVIOUS ISSUE ENTRIES.

REQUIRED FORMAT FOR EACH ISSUE ENTRY:

## ISSUE:{NAME OF ENVIRONMENT} {YYYY-MM-DD HH:MM} → {CONTENT}

${ANCHOR}`;

const ASSET_HEADER = `ASSET LOG
INSTRUCTION FOR AI MODEL:

ALWAYS ADD NEW ASSET ENTRIES AT THE TOP, DIRECTLY BELOW THIS HEADER.

NEVER DELETE OR EDIT PREVIOUS ASSET ENTRIES.

REQUIRED FORMAT FOR EACH ASSET ENTRY:

## ASSET:{NAME OF ENVIRONMENT} {YYYY-MM-DD HH:MM} → {CONTENT}

${ANCHOR}`;

function nzTimestamp() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
}

async function githubGetOrCreate(path, header) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    { headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' } }
  );
  if (res.status === 404) return { sha: null, content: header };
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
        message, ...(sha ? { sha } : {}),
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
  const issueAnalysis = process.env.ISSUE_ANALYSIS?.trim();
  const assetAnalysis = process.env.ASSET_ANALYSIS?.trim();
  if (!issueAnalysis) throw new Error('ISSUE_ANALYSIS not set');
  if (!assetAnalysis) throw new Error('ASSET_ANALYSIS not set');

  const ts = nzTimestamp();
  console.log(`📅 ${ts}`);

  const issueFile = await githubGetOrCreate(`could/CONTENT-ISSUE-${QUARTER}.md`, ISSUE_HEADER);
  await githubPut(
    `could/CONTENT-ISSUE-${QUARTER}.md`, issueFile.sha,
    insertEntry(issueFile.content, `## ISSUE:ANZ ${ts}\n${issueAnalysis}`),
    `would-update: issue ${ts}`
  );
  console.log(`✅ could/CONTENT-ISSUE-${QUARTER}.md updated`);

  const assetFile = await githubGetOrCreate(`could/CONTENT-ASSET-${QUARTER}.md`, ASSET_HEADER);
  await githubPut(
    `could/CONTENT-ASSET-${QUARTER}.md`, assetFile.sha,
    insertEntry(assetFile.content, `## ASSET:ANZ ${ts}\n${assetAnalysis}`),
    `would-update: asset ${ts}`
  );
  console.log(`✅ could/CONTENT-ASSET-${QUARTER}.md updated`);

  console.log('\n✅ Done');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
