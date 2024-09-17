import { ApplicationState } from '@amazeelabs/publisher-shared';
import cors from 'cors';
import express from 'express';
import expressWs from 'express-ws';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createHttpTerminator } from 'http-terminator';
import { HttpTerminator } from 'http-terminator/src/types';
import path, { dirname } from 'path';
import referrerPolicy from 'referrer-policy';
import { map, shareReplay, Subject } from 'rxjs';
import { fileURLToPath } from 'url';

import { core } from './core/core';
import {
  getAuthenticationMiddleware,
  isSessionRequired,
} from './core/tools/authentication';
import { getConfig } from './core/tools/config';
import { getDatabase } from './core/tools/database';
import {
  getOAuth2AuthorizeUrl,
  getPersistedAccessToken,
  hasPublisherAccess,
  initializeSession,
  isAuthenticated,
  oAuth2AuthorizationCodeClient,
  persistAccessToken,
  stateMatches,
} from './core/tools/oAuth2';
import { stateNotify } from './notify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runServer = async (): Promise<HttpTerminator> => {
  const expressServer = express();
  const expressWsInstance = expressWs(expressServer);
  const { app } = expressWsInstance;

  app.locals.isReady = false;

  // A session is only needed for OAuth2 Authorization Code grant type.
  if (isSessionRequired()) {
    initializeSession(expressServer);
  }
  // Authentication middleware based on the configuration.
  const authMiddleware = getAuthenticationMiddleware(getConfig());

  // Allow cross-origin requests
  // @TODO see if we need to lock this down
  // Default config:
  //{
  //   "origin": "*",
  //   "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  //   "preflightContinue": false,
  //   "optionsSuccessStatus": 204
  // }
  app.use(cors({ ...(getConfig().corsOptions ?? {}) }));

  // Chromium based browsers employ strict-origin-when-cross-origin if no Referrer Policy set
  // @TODO see if we need to lock this down
  app.use(referrerPolicy());

  app.use((req, res, next) => {
    res.set('Cache-control', 'no-cache');
    next();
  });

  // Add any configured response headers which should apply on every route.
  app.use((req, res, next) => {
    // The spread operator applied on a Map generates a 2D key-value array. So
    // if we have a Map with two items: key1 => value1, key2 => value2, then
    // the spread operator applied on the Map would return
    // [["key1", "value1"], ["key2", "value2"]].
    [...(getConfig().responseHeaders || new Map<string, string>())].map(
      (responseHeader) => {
        res.set(responseHeader[0], responseHeader[1]);
      },
    );
    next();
  });

  core.state.applicationState$.subscribe((state) => {
    app.locals.isReady = state === ApplicationState.Ready;
    stateNotify(state);
  });

  const updates$ = new Subject();
  app.post('/___status/update', (req, res) => {
    updates$.next(req.body);
    res.json(true);
  });
  app.ws('/___status/changes', (ws) => {
    const sub = updates$.subscribe((data) => {
      ws.send(JSON.stringify(data));
    });
    ws.on('close', sub.unsubscribe);
  });

  app.post('/___status/build', (req, res) => {
    core.build();
    res.send();
  });

  app.post('/___status/clean', (req, res) => {
    core.clean();
    res.send();
  });

  const outputWithReplay$ = core.output$
    .pipe(
      map((chunk) => `${new Date().toISOString().substring(11, 19)} ${chunk}`),
    )
    .pipe(shareReplay(500));
  outputWithReplay$.subscribe().unsubscribe(); // Make shareReplay work immediately.
  app.use('/___status/logs', authMiddleware);
  app.ws('/___status/logs', (ws) => {
    const sub = outputWithReplay$.subscribe((chunk) => {
      ws.send(chunk);
    });
    ws.on('close', sub.unsubscribe);
  });

  const applicationStateWithReplay$ = core.state.applicationState$.pipe(
    shareReplay(1),
  );
  applicationStateWithReplay$.subscribe().unsubscribe(); // Make shareReplay work immediately.
  app.ws('/___status/updates', (ws) => {
    const sub = applicationStateWithReplay$.subscribe((state) => {
      ws.send(JSON.stringify(state));
    });
    ws.on('close', sub.unsubscribe);
  });

  app.get('/___status/history', async (req, res) => {
    const { Build } = await getDatabase();
    const result = await Build.findAll({
      order: [['id', 'DESC']],
    });
    res.json(result);
  });

  app.get('/___status/history/:id', async (req, res) => {
    const { Build } = await getDatabase();
    const result = await Build.findByPk(req.params.id);
    res.json(result);
  });

  getConfig().proxy?.forEach(({ prefix, target }) => {
    app.use(
      prefix,
      authMiddleware,
      createProxyMiddleware({
        target,
        changeOrigin: true,
        on: {
          proxyReq: (proxyReq) => {
            // Add a header to identify the request as a proxy request.
            // This can be used to prevent redirect loops when the proxy target
            // redirects to the proxy itself.
            proxyReq.setHeader('SLB-Publisher-Proxy', 'true');
          },
        },
      }),
    );
  });

  // ---------------------------------------------------------------------------
  // OAuth2 routes
  // ---------------------------------------------------------------------------

  app.use('/___status', authMiddleware);
  app.use(
    '/___status',
    express.static(path.resolve(__dirname, '../../publisher-ui/dist')),
  );

  // Fallback route for login. Is used if there is no origin cookie.
  app.get('/oauth/login', async (req, res) => {
    if (await isAuthenticated(req)) {
      const accessPublisher = await hasPublisherAccess(req);
      if (accessPublisher) {
        res.send(
          'Publisher access is granted. <a href="/___status/">View status</a>',
        );
      } else {
        res.send(
          'Publisher access is not granted. Contact your site administrator. <a href="/oauth/logout">Log out</a>',
        );
      }
    } else {
      res.cookie('origin', req.path).send('<a href="/oauth">Log in</a>');
    }
  });

  // Redirects to authentication provider.
  app.get('/oauth', (req, res) => {
    const client = oAuth2AuthorizationCodeClient();
    if (!client) {
      throw new Error('Missing OAuth2 client.');
    }
    const authorizationUri = getOAuth2AuthorizeUrl(client, req);
    res.redirect(authorizationUri);
  });

  // Callback from authentication provider.
  app.get('/oauth/callback', async (req, res) => {
    const oAuth2Config = getConfig().oAuth2;
    if (!oAuth2Config) {
      throw new Error('Missing OAuth2 configuration.');
    }

    const client = oAuth2AuthorizationCodeClient();
    if (!client) {
      throw new Error('Missing OAuth2 client.');
    }

    // Check if the state matches.
    if (!stateMatches(req)) {
      return res.status(500).json('State does not match.');
    }

    const { code } = req.query;
    const options = {
      code,
      scope: oAuth2Config.scope,
      // Do not include redirect_uri, makes Drupal simple_oauth fail.
      // Returns 400 Bad Request.
      //redirect_uri: 'http://127.0.0.1:7777/callback',
    };

    try {
      // @ts-ignore options due to missing redirect_uri.
      const accessToken = await client.getToken(options);
      console.log('/oauth/callback accessToken', accessToken);
      persistAccessToken(accessToken, req);

      if (req.cookies.origin) {
        res.redirect(req.cookies.origin);
      } else {
        res.redirect('/oauth/login');
      }
    } catch (error) {
      console.error(error);
      return (
        res
          .status(500)
          // @ts-ignore
          .json(`Authentication failed with error: ${error.message}`)
      );
    }
  });

  // Removes the session.
  app.get('/oauth/logout', async (req, res) => {
    const accessToken = getPersistedAccessToken(req);
    if (!accessToken) {
      return res.status(401).send('No token found.');
    }

    // Requires this Drupal patch
    // https://www.drupal.org/project/simple_oauth/issues/2945273
    // await accessToken.revokeAll();
    req.session.destroy(function (err) {
      console.log('Remove session', err);
    });
    res.redirect('/oauth/login');
  });

  const servePort = getConfig().commands.serve?.port;
  if (servePort) {
    // Use the authentication middleware for the proxy.
    app.use(
      '/',
      authMiddleware,
      createProxyMiddleware({
        pathFilter: () => app.locals.isReady,
        target: `http://127.0.0.1:${servePort}`,
      }),
    );
  } else {
    // When not serving, redirect to the status
    // that will use the authentication middleware if needed.
    app.get('/', async (req, res) => {
      res.redirect('/___status/');
    });
  }

  app.get('*', (req, res, next) => {
    if (!req.app.locals.isReady) {
      if (req.accepts('text/html')) {
        res.redirect(302, `/___status/status.html?dest=${req.originalUrl}`);
      } else {
        res.status(404);
      }
      res.end();
    }
    next();
  });

  const host = getConfig().publisherHost || '0.0.0.0';
  const port = getConfig().publisherPort;
  const server = await app.listen({ host, port });
  const terminator = createHttpTerminator({ server });
  console.log(`Server started on http://${host}:${port}`);
  return terminator;
};

export { runServer };
