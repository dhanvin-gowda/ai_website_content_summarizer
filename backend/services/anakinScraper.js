const BASE_URL = process.env.ANAKIN_API_BASE_URL || 'https://api.anakin.io/v1';
const POLL_INTERVAL_MS = Number(process.env.ANAKIN_POLL_INTERVAL_MS) || 3000;
const POLL_TIMEOUT_MS = Number(process.env.ANAKIN_POLL_TIMEOUT_MS) || 180000;

function getApiKey() {
  const apiKey = process.env.ANAKIN_API_KEY;
  if (!apiKey) {
    throw new Error('ANAKIN_API_KEY is not configured. Add it to your .env file.');
  }
  return apiKey;
}

function getAuthHeaders() {
  const apiKey = getApiKey();
  return {
    'X-API-Key': apiKey,
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseErrorResponse(response) {
  try {
    const data = await response.json();
    return data.message || data.error || JSON.stringify(data);
  } catch {
    return response.statusText || 'Unknown error';
  }
}

function extractTitle(markdown, url) {
  const headingMatch = markdown.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  try {
    return new URL(url).hostname;
  } catch {
    return 'Untitled Page';
  }
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeScrapeResult(data, url) {
  const markdown = data.markdown || data.summary || '';
  const text = markdown || stripHtml(data.cleanedHtml || data.html || '');

  if (!text.trim()) {
    throw new Error('Anakin returned empty content for this URL');
  }

  return {
    url: data.url || url,
    title: extractTitle(markdown, url),
    text,
    markdown: markdown || text,
    generatedJson: data.generatedJson || null,
  };
}

async function scrapeAsync(url, options = {}) {
  const submitResponse = await fetch(`${BASE_URL}/url-scraper`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      url,
      country: 'us',
      useBrowser: options.useBrowser ?? false,
      generateJson: options.generateJson ?? false,
    }),
  });

  if (!submitResponse.ok) {
    throw new Error(`Anakin scrape failed: ${await parseErrorResponse(submitResponse)}`);
  }

  const { jobId } = await submitResponse.json();
  if (!jobId) {
    throw new Error('Anakin did not return a job ID');
  }

  const started = Date.now();

  while (Date.now() - started < POLL_TIMEOUT_MS) {
    await sleep(POLL_INTERVAL_MS);

    const pollResponse = await fetch(`${BASE_URL}/url-scraper/${jobId}`, {
      headers: getAuthHeaders(),
    });

    if (!pollResponse.ok) {
      throw new Error(`Anakin poll failed: ${await parseErrorResponse(pollResponse)}`);
    }

    const result = await pollResponse.json();

    if (result.status === 'completed') {
      return normalizeScrapeResult(result, url);
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Anakin scrape job failed');
    }
  }

  throw new Error('Anakin scrape timed out while waiting for results');
}

export async function scrapeUrlWithAnakin(url, options = {}) {
  return scrapeAsync(url, options);
}
