import * as cheerio from 'cheerio';
import { URL } from 'url';

/**
 * Validates that a URL does not point to a private/internal network address.
 * Prevents SSRF attacks by blocking requests to localhost, private IPs, and link-local addresses.
 */
function isBlockedHost(hostname: string): boolean {
  // Block localhost variants
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]') {
    return true;
  }

  // Block private IPv4 ranges: 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 169.254.x.x
  const privateRanges = [
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
    /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/,
    /^192\.168\.\d{1,3}\.\d{1,3}$/,
    /^169\.254\.\d{1,3}\.\d{1,3}$/,
    /^0\.0\.0\.0$/,
  ];

  for (const range of privateRanges) {
    if (range.test(hostname)) {
      return true;
    }
  }

  // Block common internal hostnames
  if (hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return true;
  }

  return false;
}

/**
 * Fetches a URL and extracts readable text content from the HTML.
 * Strips scripts, styles, and other non-content elements.
 * Validates the URL to prevent SSRF attacks.
 */
export async function fetchPageText(url: string): Promise<string> {
  const parsed = new URL(url);

  if (isBlockedHost(parsed.hostname)) {
    throw new Error('Requests to private or internal addresses are not allowed');
  }

  const response = await fetch(parsed.href, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; CustomResume/1.0)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(15000),
    redirect: 'error',
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
