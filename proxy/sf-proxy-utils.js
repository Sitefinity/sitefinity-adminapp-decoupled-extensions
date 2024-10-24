const url = require('url');

const headerBypassHostValidationKey = 'X-SF-BYPASS-HOST-VALIDATION-KEY';
const headerBypassHostKey = 'X-SF-BYPASS-HOST';

function shouldBypassHost(req, config) {
  let bypassHost = '';
  const remoteValidationKey = config.SF_LOCAL_VALIDATION_KEY;
  if (remoteValidationKey) {
    const bypassHostHeader = req.headers[headerBypassHostKey.toLowerCase()];
    const bypassHostValidationHeader = req.headers[headerBypassHostValidationKey.toLowerCase()];

    if (bypassHostHeader && bypassHostValidationHeader) {
      const bypassHostKey = bypassHostValidationHeader;
      const bypassHostValue = bypassHostHeader;

      if (bypassHostKey === remoteValidationKey) {
        bypassHost = bypassHostValue;
      } else {
        throw new Error(
          `The provided local validation key - '${remoteValidationKey}' is not valid or it is expired.`
        );
      }
    }
  }
  return bypassHost;
}

function generateProxyRequest(req, bypassHost, config) {
  const headers = { ...req.headers };
  headers['X-SFRENDERER-PROXY'] = 'true';
  headers['X-SFRENDERER-PROXY-NAME'] = config.RENDERER_NAME;

  if (!headers['X-SF-WEBSERVICEPATH']) {
    headers['X-SF-WEBSERVICEPATH'] = config.SF_WEBSERVICE_PATH;
  }

  let resolvedHost =
    config.SF_PROXY_ORIGINAL_HOST ||
    req.headers['x-forwarded-host'] ||
    req.headers['host'];

  if (!resolvedHost) {
    resolvedHost = 'localhost';
  }

  const hostHeaderName = config.SF_HOST_HEADER_NAME || 'X-ORIGINAL-HOST';
  if (config.SF_LOCAL_VALIDATION_KEY) {
    delete headers[hostHeaderName.toLowerCase()];
    if (config.SF_LOCAL_VALIDATION_KEY) {
      headers[headerBypassHostKey] = resolvedHost;
      headers[headerBypassHostValidationKey] = config.SF_LOCAL_VALIDATION_KEY;
    } else if (bypassHost) {
      headers[hostHeaderName] = bypassHost;
    } else {
      headers[hostHeaderName] = resolvedHost;
    }
  } else {
    headers[hostHeaderName] = resolvedHost;
  }

  const proxyURL = new URL(config.SF_CMS_URL);
  const requestURL = new URL(req.url, `http://${req.headers.host}`);

  requestURL.hostname = proxyURL.hostname;
  requestURL.protocol = proxyURL.protocol;
  requestURL.port = proxyURL.port;

  headers['host'] = requestURL.host;

  return { url: requestURL, headers };
}

module.exports = {
  shouldBypassHost,
  generateProxyRequest,
};
