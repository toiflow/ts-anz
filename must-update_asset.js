// ========================================
// MUST-UPDATE ASSET - NZ INTEREST RATE ASSET LOG
// Fetches news → analyzes via Claude → prepends to -ASSET-v1.md on GitHub
// Format: ## ASSET:ANZ {YYYY-MM-DD HH:MM} → {content}
// ========================================

function mustUpdateAsset() {
  var SCRIPT_NAME = GLOBAL_CONFIG.SCRIPT_NAME;
  var EMAIL_TO = GLOBAL_CONFIG.EMAIL_TO;
  var PATH = GLOBAL_CONFIG.GITHUB_ASSET_PATH;

  Logger.log('╔═══════════════════════════════════════════════════════════╗');
  Logger.log('║       MUST-UPDATE ASSET - NZ INTEREST RATE ANALYSIS       ║');
  Logger.log('╚═══════════════════════════════════════════════════════════╝');
  Logger.log('');

  var startTime = new Date();
  var stats = { newsItems: 0, claudeOk: false, githubOk: false, errors: 0 };
  var report = [];

  try {
    // ── 1. fetch news ────────────────────────────────────────────
    Logger.log('📰 Fetching NZ interest rate news...');
    var items = fetchNewsItems();
    stats.newsItems = items.length;
    Logger.log('✅ ' + items.length + ' item(s) found');
    Logger.log('');

    if (items.length === 0) {
      Logger.log('ℹ️  No relevant news — skipping update');
      return;
    }

    var context = buildNewsContext(items);

    // ── 2. claude analysis ───────────────────────────────────────
    Logger.log('🤖 Calling Claude for ASSET analysis...');

    var prompt = 'You are a financial asset analyst. Based on the NZ interest rate news below, summarize: ' +
      '1) the current OCR or rate level if mentioned, ' +
      '2) what this means for asset classes (property, bonds, equities, savings), ' +
      '3) any opportunity or positioning signal. ' +
      'Be concise — 2-4 sentences max. Do not use bullet points. Plain text only.\n\n' +
      context;

    var analysis = callClaude(prompt);
    stats.claudeOk = true;
    Logger.log('✅ Claude analysis complete');
    Logger.log('');

    // ── 3. build entry ───────────────────────────────────────────
    var timestamp = formatDateTime(new Date());
    var entry = '## ASSET:ANZ ' + timestamp + ' → ' + analysis.trim();

    report.push(entry);

    // ── 4. update github ─────────────────────────────────────────
    Logger.log('📝 Updating GitHub: ' + PATH + '...');

    var file = githubGetFile(PATH);
    var newContent = insertEntry(file.content, entry);
    githubUpdateFile(PATH, file.sha, newContent, 'must-update_asset: NZ interest rate ' + timestamp);

    stats.githubOk = true;
    Logger.log('✅ GitHub updated');
    Logger.log('');

  } catch (e) {
    Logger.log('❌ Error: ' + e.message);
    stats.errors++;
  }

  var duration = ((new Date() - startTime) / 1000).toFixed(2);

  // ── send email ───────────────────────────────────────────────────────────

  if (stats.githubOk) {
    var body = report.join('\n\n');
    try {
      MailApp.sendEmail({
        to: EMAIL_TO,
        subject: SCRIPT_NAME,
        body: body,
        attachments: [Utilities.newBlob(body, 'text/plain', 'must-update_asset.txt')]
      });
      Logger.log('✅ Email sent to: ' + EMAIL_TO);
    } catch (e) {
      Logger.log('❌ Email failed: ' + e.message);
    }
  }

  Logger.log('');
  Logger.log('╔═══════════════════════════════════════════════════════════╗');
  Logger.log('║                      UPDATE SUMMARY                       ║');
  Logger.log('╠═══════════════════════════════════════════════════════════╣');
  Logger.log('║  📰 News items:        ' + pad(stats.newsItems) + '                          ║');
  Logger.log('║  🤖 Claude:            ' + (stats.claudeOk ? ' OK' : 'FAIL') + '                          ║');
  Logger.log('║  📝 GitHub:            ' + (stats.githubOk ? ' OK' : 'FAIL') + '                          ║');
  Logger.log('║  ❌ Errors:            ' + pad(stats.errors) + '                          ║');
  Logger.log('╚═══════════════════════════════════════════════════════════╝');
}
