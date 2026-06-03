// ========================================
// MUST-READ NEWS - NZ INTEREST RATE FETCH
// Fetches RBNZ RSS feed
// Filters for interest rate / OCR items
// Returns structured news for downstream scripts
// ========================================

function mustReadNews() {
  var SCRIPT_NAME = GLOBAL_CONFIG.SCRIPT_NAME;
  var EMAIL_TO = GLOBAL_CONFIG.EMAIL_TO;

  Logger.log('╔═══════════════════════════════════════════════════════════╗');
  Logger.log('║         MUST-READ NEWS - NZ INTEREST RATE FETCH           ║');
  Logger.log('╚═══════════════════════════════════════════════════════════╝');
  Logger.log('');
  Logger.log('📌 Source: ' + GLOBAL_CONFIG.NEWS_RSS_URL);
  Logger.log('📌 Keywords: ' + GLOBAL_CONFIG.NEWS_KEYWORDS.join(', '));
  Logger.log('');

  var startTime = new Date();
  var items = [];
  var stats = { total: 0, relevant: 0, errors: 0 };

  try {
    items = fetchNewsItems();
    stats.relevant = items.length;

    Logger.log('✅ Found ' + items.length + ' relevant item(s)');
    Logger.log('');

    for (var i = 0; i < items.length; i++) {
      Logger.log('  📰 [' + (i + 1) + '] ' + items[i].title);
      Logger.log('       ' + items[i].pubDate);
      Logger.log('');
    }
  } catch (e) {
    Logger.log('❌ Error: ' + e.message);
    stats.errors++;
  }

  var duration = ((new Date() - startTime) / 1000).toFixed(2);

  Logger.log('╔═══════════════════════════════════════════════════════════╗');
  Logger.log('║                      FETCH SUMMARY                        ║');
  Logger.log('╠═══════════════════════════════════════════════════════════╣');
  Logger.log('║  📰 Relevant items:    ' + pad(stats.relevant) + '                          ║');
  Logger.log('║  ❌ Errors:            ' + pad(stats.errors) + '                          ║');
  Logger.log('╚═══════════════════════════════════════════════════════════╝');
  Logger.log('');
  Logger.log('ℹ️  Next: Run must-update_issue → must-update_asset');

  return items;
}
