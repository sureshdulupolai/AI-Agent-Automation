/**
 * Real-Time Website Widget Verification Controller
 * Performs active HTTP probe to scan a target website HTML for OmniBot script tags.
 */

export async function verifyWebsiteWidget(req, res) {
  const { url, botId } = req.body;

  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({
      success: false,
      status: 'invalid_url',
      message: 'Please enter a valid website URL or domain name.'
    });
  }

  let targetUrl = url.trim();

  // Normalize protocol
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    if (targetUrl.startsWith('localhost') || targetUrl.startsWith('127.0.0.1')) {
      targetUrl = `http://${targetUrl}`;
    } else {
      targetUrl = `https://${targetUrl}`;
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OmniBot-Widget-Verification/1.0; +https://omnibot.io)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.json({
        success: false,
        status: 'http_error',
        statusCode: response.status,
        message: `Website returned HTTP status ${response.status} (${response.statusText}). Please make sure the page is published and publicly accessible.`
      });
    }

    const htmlContent = await response.text();

    // Check for OmniBot widget indicators
    const hasWidgetScript = htmlContent.includes('widget.js') || 
                            htmlContent.includes('omnibot-widget-host') ||
                            (botId && htmlContent.includes(`data-bot-id="${botId}"`)) ||
                            htmlContent.includes('data-bot-id');

    if (hasWidgetScript) {
      return res.json({
        success: true,
        status: 'verified',
        targetUrl,
        message: `Widget detected successfully on ${new URL(targetUrl).hostname}! AI agent is active and ready to engage visitors.`
      });
    } else {
      return res.json({
        success: false,
        status: 'not_found',
        targetUrl,
        message: `Connected to ${new URL(targetUrl).hostname}, but the OmniBot script tag was not found in the HTML source. Please verify you pasted the code snippet before the </body> tag and published your changes.`
      });
    }

  } catch (error) {
    let errorMessage = `Could not reach ${targetUrl}.`;

    if (error.name === 'AbortError') {
      errorMessage = `Connection to ${targetUrl} timed out after 7 seconds. Please check the website speed or accessibility.`;
    } else if (error.cause && error.cause.code === 'ENOTFOUND') {
      errorMessage = `Domain "${new URL(targetUrl).hostname}" could not be found. Please check spelling.`;
    } else if (error.cause && error.cause.code === 'ECONNREFUSED') {
      errorMessage = `Connection refused at ${targetUrl}. Is the local/live server running?`;
    } else if (error.message) {
      errorMessage = `Unable to verify website: ${error.message}`;
    }

    return res.json({
      success: false,
      status: 'unreachable',
      targetUrl,
      message: errorMessage
    });
  }
}
