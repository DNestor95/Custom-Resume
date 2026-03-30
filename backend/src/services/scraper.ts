import * as cheerio from 'cheerio';

/**
 * Fetches a URL and extracts readable text content from the HTML.
 * Strips scripts, styles, and other non-content elements.
 */
export async function fetchPageText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; CustomResume/1.0)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove non-content elements
  $('script, style, nav, footer, header, iframe, noscript, svg').remove();

  // Extract text from the body
  const text = $('body').text();

  // Clean up whitespace: collapse multiple spaces/newlines
  return text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}
