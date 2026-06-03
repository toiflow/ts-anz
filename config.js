var GLOBAL_CONFIG = {
  SCRIPT_NAME: DriveApp.getFileById(ScriptApp.getScriptId()).getName(),
  EMAIL_TO: 'jayreck996@gmail.com',

  // stored in Script Properties: CLAUDE_API_KEY, GITHUB_TOKEN
  CLAUDE_MODEL: 'claude-opus-4-8',
  CLAUDE_MAX_TOKENS: 1024,

  GITHUB_OWNER: 'jayreck996',
  GITHUB_REPO: '-anz',
  GITHUB_ISSUE_PATH: '-ISSUE-v1.md',
  GITHUB_ASSET_PATH: '-ASSET-v1.md',
  GITHUB_COMMITTER: { name: 'gs-anz', email: 'jayreck996@gmail.com' },

  NEWS_RSS_URL: 'https://www.rbnz.govt.nz/hub/news/rss',
  NEWS_KEYWORDS: ['interest rate', 'ocr', 'official cash rate', 'monetary policy', 'inflation', 'reserve bank']
};

// ========================================
// SHARED HELPER FUNCTIONS
// ========================================

function pad(num) {
  var str = num.toString();
  while (str.length < 3) str = ' ' + str;
  return str;
}

function formatDateTime(date) {
  return Utilities.formatDate(date, 'Pacific/Auckland', 'yyyy-MM-dd HH:mm');
}

// ── news ────────────────────────────────────────────────────────────────────

function fetchNewsItems() {
  var response = UrlFetchApp.fetch(GLOBAL_CONFIG.NEWS_RSS_URL, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) {
    throw new Error('RSS fetch failed: ' + response.getResponseCode());
  }

  var xml = XmlService.parse(response.getContentText());
  var channel = xml.getRootElement().getChild('channel');
  var items = channel.getChildren('item');

  var keywords = GLOBAL_CONFIG.NEWS_KEYWORDS;
  var results = [];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var title = (item.getChildText('title') || '').toLowerCase();
    var desc  = (item.getChildText('description') || '').toLowerCase();

    var relevant = keywords.some(function(kw) {
      return title.indexOf(kw) !== -1 || desc.indexOf(kw) !== -1;
    });

    if (relevant) {
      results.push({
        title: item.getChildText('title') || '',
        description: item.getChildText('description') || '',
        link: item.getChildText('link') || '',
        pubDate: item.getChildText('pubDate') || ''
      });
    }
  }

  return results;
}

function buildNewsContext(items) {
  if (items.length === 0) return 'No recent NZ interest rate news found.';
  return items.map(function(item, i) {
    return '[' + (i + 1) + '] ' + item.title + '\n' + item.pubDate + '\n' + item.description + '\n' + item.link;
  }).join('\n\n');
}

// ── claude ──────────────────────────────────────────────────────────────────

function callClaude(prompt) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  if (!apiKey) throw new Error('CLAUDE_API_KEY not set in Script Properties');

  var payload = {
    model: GLOBAL_CONFIG.CLAUDE_MODEL,
    max_tokens: GLOBAL_CONFIG.CLAUDE_MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }]
  };

  var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) {
    throw new Error('Claude API error: ' + response.getResponseCode() + ' ' + response.getContentText());
  }

  var result = JSON.parse(response.getContentText());
  return result.content[0].text;
}

// ── github ──────────────────────────────────────────────────────────────────

function githubGetFile(path) {
  var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  var url = 'https://api.github.com/repos/' + GLOBAL_CONFIG.GITHUB_OWNER + '/' + GLOBAL_CONFIG.GITHUB_REPO + '/contents/' + path;

  var response = UrlFetchApp.fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json'
    },
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) {
    throw new Error('GitHub GET failed: ' + response.getResponseCode());
  }

  var data = JSON.parse(response.getContentText());
  return {
    sha: data.sha,
    content: Utilities.newBlob(Utilities.base64Decode(data.content.replace(/\n/g, ''))).getDataAsString()
  };
}

function githubUpdateFile(path, sha, newContent, commitMessage) {
  var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  var url = 'https://api.github.com/repos/' + GLOBAL_CONFIG.GITHUB_OWNER + '/' + GLOBAL_CONFIG.GITHUB_REPO + '/contents/' + path;

  var encoded = Utilities.base64Encode(Utilities.newBlob(newContent).getBytes());

  var payload = {
    message: commitMessage,
    content: encoded,
    sha: sha,
    committer: GLOBAL_CONFIG.GITHUB_COMMITTER
  };

  var response = UrlFetchApp.fetch(url, {
    method: 'put',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200 && response.getResponseCode() !== 201) {
    throw new Error('GitHub PUT failed: ' + response.getResponseCode() + ' ' + response.getContentText());
  }

  return JSON.parse(response.getContentText());
}

// Inserts a new entry below the anchor marker
function insertEntry(currentContent, newEntry) {
  var anchor = '####### <!-- ANCHOR MARKER - ADD ALL NEW ASSET ENTRIES DIRECTLY BELOW THIS LINE, NEVER DELETE OR EDIT PREVIOUS ASSET ENTRIES-->';
  var idx = currentContent.indexOf(anchor);
  if (idx === -1) throw new Error('Anchor marker not found in file');
  var insertAt = idx + anchor.length;
  return currentContent.slice(0, insertAt) + '\n' + newEntry + '\n' + currentContent.slice(insertAt);
}
