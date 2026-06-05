ISSUE LOG
INSTRUCTION FOR AI MODEL:

ALWAYS ADD NEW ISSUE ENTRIES AT THE TOP, DIRECTLY BELOW THIS HEADER.

REQUIRED FORMAT FOR EACH ISSUE ENTRY:

## ISSUE:{NAME OF ENVIRONMENT} {YYYY-MM-DD HH:MM} → {CONTENT}

####### <!-- ANCHOR MARKER - ADD ALL NEW ASSET ENTRIES DIRECTLY BELOW THIS LINE, NEVER DELETE OR EDIT PREVIOUS ASSET ENTRIES-->
## ISSUE:gs-anz 2026-06-06 → would-update-docs.js renamed to would-update-content.js

Name `would-update-docs` no longer reflects purpose — the script updates content files, not generic docs.

**Fix:** Renamed to `would-update-content.js`. Updated `would-update.yml` `run:` call from `node would-update-docs.js` → `node would-update-content.js`.

## ISSUE:gs-anz 2026-06-06 → would-update.yml caller reference must be updated — must-update-access renamed to must-update-content

`toiflow/-toiflow/.github/workflows/must-update-access.yml` was renamed to `must-update-content.yml`. Both `issue` and `asset` job `uses:` references in `would-update.yml` pointed to the old filename — pipeline would fail until updated.

**Fix:** Updated both references to `toiflow/-toiflow/.github/workflows/must-update-content.yml@main`.
## ISSUE:gs-anz 2026-06-05 → OLLAMA_SECRET + OLLAMA_URL pending org migration

`GS_ANZ_TOKEN` removed. `OLLAMA_SECRET` and `OLLAMA_URL` still repo-level — pending `admin:org` auth to move to org level. Tracked in `-toiflow/-ISSUE-v1.md`.

## ISSUE:gs-anz 2026-06-05 → repo-level secrets pending migration to toiflow org level

**Status:** `GS_ANZ_TOKEN`, `OLLAMA_SECRET`, `OLLAMA_URL` are currently set as repo-level secrets in `toiflow/gs-anz`. Plan is to move all three to org-level so any future `toiflow` repo inherits them automatically.

**Blocked on:** `admin:org` GitHub scope — browser auth required (`gh auth refresh -h github.com -s admin:org`, code **E771-FA65** at `github.com/login/device`). Once authed, Claude can set all three at org level and remove repo-level duplicates.
## ISSUE:ANZ 2026-06-05 19:15
- RBNZ is expected to keep the official cash rate unchanged at 2.25%.
- Risks suggest rates may rise sooner than anticipated, impacting borrowing costs and inflation expectations.
- No urgent action signals are indicated in the current news; however, borrowers should monitor future rate changes closely.

## ISSUE:ANZ 2026-06-05 19:09
- RBNZ expects to leave the official cash rate unchanged at 2.25% for now.
- Rates may rise sooner than expected, according to RBNZ warnings.
- Investors and borrowers should prepare for potential future rate increases.
- No urgent action signals are indicated in the current news updates.

