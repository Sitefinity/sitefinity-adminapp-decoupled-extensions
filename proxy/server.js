const config = {
  SF_WEBSERVICE_PATH: 'sf/system',    // Optional: 'api/default'
  SF_PROXY_ORIGINAL_HOST: '',         // Optional: 'your-original-host'
  SF_HOST_HEADER_NAME: 'X-ORIGINAL-HOST',
  SF_CMS_URL: '', // Replace with your Sitefinity Cloud URL
  RENDERER_NAME: 'NextJS',            // Replace with your renderer name
  SF_LOCAL_VALIDATION_KEY: ``
};

const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const zlib = require('zlib');
const https = require('https');
const selfsigned = require('selfsigned');
const mime = require('mime-types');

const { generateProxyRequest, shouldBypassHost } = require('./sf-proxy-utils');
const path = require('path');
const { readFileSync } = require('fs');

const app = express();

const pems = selfsigned.generate(null, { days: 365 });

// SSL options
const sslOptions = {
  key: pems.private,
  cert: pems.cert,
};

const PORT = 5001;


// Middleware function to intercept requests
app.use((req, res, next) => {
  let bypassHost = shouldBypassHost(req, config);

  // Define known CMS paths and patterns
  const cmsPaths = [
    '/sfextensions/',
    '/Sitefinity/Services',
    '/Sitefinity/adminapp',
    '/Sitefinity/SignOut',
    '/SFSitemap/',
    '/adminapp',
    '/sf/system',
    '/api/default',
    '/ws/',
    '/restapi/',
    '/contextual-help',
    '/res/',
    '/admin-bridge/',
    '/sfres/',
    '/images/',
    '/documents/',
    '/docs/',
    '/videos/',
    '/forms/submit',
    '/ExtRes/',
    '/TranslationRes/',
    '/RBinRes/',
    '/ABTestingRes/',
    '/DataIntelligenceConnector/',
    '/signin-facebook',
    '/Frontend-Assembly/',
    '/Telerik.Sitefinity.Frontend/',
  ];

  const authRegex = /\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\/oauth2\/authorize/;

  const isCmsPath =
    cmsPaths.some((path) => req.path.toUpperCase().startsWith(path.toUpperCase())) ||
    req.path.toLowerCase() === '/sitefinity' ||
    /\/sitefinity\/(?!(template|forms))/i.test(req.path) ||
    req.path.indexOf('.axd') !== -1 ||
    req.path.match(authRegex) !== null;

  if (bypassHost || isCmsPath) {
    const { url, headers } = generateProxyRequest(req, bypassHost, config);

    // Proxy the request to Sitefinity Cloud
    createProxyMiddleware({
      target: config.SF_CMS_URL,
      changeOrigin: true,
      pathRewrite: (path, req) => url.pathname + url.search,
      on: {
        proxyReq: async (proxyReq, req, res) => {
          // Set custom headers
          Object.keys(headers).forEach((header) => {
            proxyReq.setHeader(header, headers[header]);
            try {
              delete req.headers[header];
            } catch (_) { }
          });
        },
        proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
          if (!responseBuffer) {
            responseBuffer = Buffer.alloc(0);
          }

          let body = responseBuffer;
          const contentEncoding = proxyRes.headers['content-encoding'];

          // Remove unnecessary headers
          if (proxyRes.headers && proxyRes.headers['x-middleware-rewrite']) {
            delete proxyRes.headers['x-middleware-rewrite'];
          }

          if (proxyRes.headers && proxyRes.headers['content-security-policy']) {
            delete proxyRes.headers['content-security-policy'];
          }

          // Decompress the response if needed
          try {
            if (contentEncoding && contentEncoding.includes('gzip')) {
              body = zlib.gunzipSync(body);
              delete proxyRes.headers['content-encoding'];
            } else if (contentEncoding && contentEncoding.includes('deflate')) {
              body = zlib.inflateSync(body);
              delete proxyRes.headers['content-encoding'];
            } else if (contentEncoding && contentEncoding.includes('br')) {
              body = zlib.brotliDecompressSync(body);
              delete proxyRes.headers['content-encoding'];
            } else {
              // Body is already in the correct format
            }
          } catch (err) {
            // console.error('Decompression error:', err);
          }

          let responseString;
          try {
            responseString = body.toString('utf8');
          } catch (err) {
            // console.error('Error converting body to string:', err);
            // Send original response if conversion fails
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            // res.end(responseBuffer);
          }

          if (proxyRes.statusCode === 301 || proxyRes.statusCode === 302) {
            let location = proxyRes.headers['location'];

            if (location) {
              const cmsUrl = new URL(config.SF_CMS_URL);
              const cmsDomain = cmsUrl.origin;

              let locationUrl = new URL(location, cmsDomain);

              locationUrl.protocol = 'https:';
              locationUrl.hostname = 'localhost';
              locationUrl.port = PORT;

              res.setHeader('Location', locationUrl.toString());
            }

            Object.keys(proxyRes.headers).forEach((key) => {
              if (key.toLowerCase() === 'location') {
                // Already handled
                return;
              }
              res.setHeader(key, proxyRes.headers[key]);
            });

            res.statusCode = proxyRes.statusCode;
            return responseString;
          }

          if (req.path.includes(`Default.GetConfigValues(configKey='AdminAppExtensionsConfig'`)) {
            responseString = JSON.stringify({
              CustomFieldsEnabled: true,
              DevModeExtensionsUrl: null,
              DeveloperMode: false,
              ExtensionsUrl: `https://localhost:${PORT}/`,
              FeatureEnabled: true,
              RteEnabled: true
            });
          }

          // Handle extensions code
          if (req.path.includes('/sfextensions/')) {
            if (req.path.includes('sfextensions/custom-fields')) {
              let lastPart = req.path.split('/').pop();
              if (lastPart === '') {
                lastPart = 'index.html';
              }
              let extension = path.extname(lastPart);
              let contentType = mime.lookup(extension);
              let jsonPath = path.join(__dirname, "..", "dist", "sfextensions", "custom-fields", lastPart);
              responseString = readFileSync(jsonPath, { encoding: 'utf8' });
              if (contentType) {
                res.setHeader('Content-Type', contentType);
                proxyRes.headers['content-type'] = contentType;
              }
              proxyRes.statusCode = 200;
            }

            if (req.path.includes("sfextensions/rte/")) {
              let lastPart = req.path.split('/').pop();

              let extension = path.extname(lastPart);
              let contentType = mime.lookup(extension);
              let jsonPath = path.join(__dirname, "..", "dist", "sfextensions", "rte", lastPart);
              responseString = readFileSync(jsonPath, { encoding: 'utf8' });
              if (contentType) {
                res.setHeader('Content-Type', contentType);
                proxyRes.headers['content-type'] = contentType;
              }
              proxyRes.statusCode = 200;
            }

          }

          res.setHeader('Content-Length', Buffer.byteLength(responseString));

          Object.keys(proxyRes.headers).forEach((key) => {
            if (['content-length', 'content-encoding', 'x-middleware-rewrite'].includes(key.toLowerCase())) {
              // Already handled or not needed
              return;
            }
            res.setHeader(key, proxyRes.headers[key]);
          });

          res.statusCode = proxyRes.statusCode;
          return responseString;
        }),
        error(err, req, res) {
          console.error('Proxy error:', err);
          res.status(500).send('Proxy error');
        },
      },
      selfHandleResponse: true,
    })(req, res, next);
  } else {
    next();
  }
});


https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS server is running on https://localhost:${PORT}`);
});