ASSET LOG
INSTRUCTION FOR AI MODEL:

ALWAYS ADD NEW ASSET ENTRIES AT THE TOP, DIRECTLY BELOW THIS HEADER.

REQUIRED FORMAT FOR EACH ASSET ENTRY:

## ASSET:{NAME OF ENVIRONMENT} {YYYY-MM-DD HH:MM} → {CONTENT}

####### <!-- ANCHOR MARKER - ADD ALL NEW ASSET ENTRIES DIRECTLY BELOW THIS LINE, NEVER DELETE OR EDIT PREVIOUS ASSET ENTRIES-->
## ASSET:gs-anz 2026-06-05 → full migration from GAS + Claude API to GitHub Actions + Ollama

| Component | Detail |
|---|---|
| RSS fetch | `would-read-md.js` — Google News, keyword filter, 5-item cap |
| Ollama call | `would-update-md.js` — `qwen2.5:7b` via `local.toigroup.co.nz`, `x-secret` WAF header |
| Schedule | `.github/workflows/would-update.yml` — 6am NZST daily (18:00 UTC) + `workflow_dispatch` |
| Output | `would/-content-issue-v1.md`, `would/-content-asset-v1.md` |
| Org | Repo migrated from `jayreck996/gs-anz` → `toiflow/gs-anz` |
| Secrets | `GS_ANZ_TOKEN`, `OLLAMA_URL`, `OLLAMA_SECRET` set at repo level (org migration pending) |
| Old GAS files | Deleted — `config.js`, `appsscript.json`, `must-*.js` |

**Pipeline verified:** end-to-end test passed locally and via GitHub Actions `workflow_dispatch`.
## ASSET:ANZ 2026-06-05 19:15
- Current OCR level: 2.25%
- Property: Stable property market; no immediate need for significant adjustments in strategies.
- Bonds: Rates unchanged, may impact bond yields minimally; could consider short-term bonds if seeking higher returns.
- Equities: No rate change likely keeps equity markets stable but does not signal major opportunities or threats.
- Savings: Minimal changes to savings accounts, continue with current low-interest savings options.

## ASSET:ANZ 2026-06-05 19:09
- OCR at 2.25% is expected to remain unchanged.
- Property: No significant impact; market stability maintained.
- Bonds: Stable yields; prices may stabilize.
- Equities: Mildly positive outlook; potential for slight increase in valuations.
- Savings: Interest rates stable; savings returns unchanged.

## ASSET:ANZ 2026-06-03 17:53
- Current level: OCR held at 2.25% (May 2026) in a split decision, but RBNZ has turned hawkish, flagging imminent hikes—possibly September—to counter oil/energy-driven inflation, with banks like ANZ tipping three hikes.
- Property: Mortgage rates set to rise from the 2.25% trough; flat house prices expected and borrowers face pressure to fix/lock rates before hikes bite.
- Bonds: Wholesale and longer-term yields rising on hawkish signals; existing bond prices pressured, but newly issued bonds will offer higher yields for fresh buyers.
- Equities: Higher-rate outlook is a headwind for rate-sensitive and growth stocks; a stronger NZD (above 0.5950) may pressure exporter earnings.
- Savings/positioning: Term deposit and savings rates likely to improve as hikes near—favour shorter-dated deposits to reroll higher, and consider fixing mortgages now ahead of rises.

## ASSET:ANZ 2026-06-03 17:52 → The RBNZ held the OCR at 2.25% in a closely split 3-3 decision resolved by the Governor's casting vote, but delivered a hawkish signal that rates will rise sooner and faster than previously flagged—driven by an energy/oil-price inflation shock—with a hike possible as early as July or September. This regime shift is negative for bonds (yields rising, prices falling) and pressures property via higher mortgage rates, while savers benefit from improving term-deposit returns; equities face headwinds from a higher discount rate and a strengthening NZD that weighs on exporters. Positioning signal: favour shorter-duration bonds and floating cash, lock in term-deposit rates ahead of further hikes, stay cautious on rate-sensitive property and growth equities, and the hawkish tilt is supportive of long-NZD exposure (notably versus AUD).
