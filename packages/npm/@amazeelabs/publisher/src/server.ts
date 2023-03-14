import { ApplicationState } from '@amazeelabs/publisher-shared';
import cors from 'cors';
import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import basicAuth from 'express-basic-auth';
import expressWs from 'express-ws';
import {
  createProxyMiddleware,
  responseInterceptor,
} from 'http-proxy-middleware';
import { createHttpTerminator } from 'http-terminator';
import { HttpTerminator } from 'http-terminator/src/types';
import path, { dirname } from 'path';
import referrerPolicy from 'referrer-policy';
import { map, shareReplay, Subject } from 'rxjs';
import { fileURLToPath } from 'url';

import { core } from './core/core';
import { getConfig } from './core/tools/config';
import { getDatabase } from './core/tools/database';
import { stateNotify } from './notify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runServer = async (): Promise<HttpTerminator> => {
  const ews = expressWs(express());
  const { app } = ews;

  app.locals.isReady = false;

  // Basic Authentication
  const authMiddleware = ((): RequestHandler => {
    const credentials = getConfig().basicAuth;
    return credentials
      ? basicAuth({
          users: { [credentials.username]: credentials.password },
          challenge: true,
        })
      : (req: Request, res: Response, next: NextFunction): void => next();
  })();

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

  app.use(
    '/___status/elements.js',
    express.static(
      path.resolve(__dirname, '../../publisher-elements/dist/elements.js'),
    ),
  );

  app.use('/___status', authMiddleware);
  app.use(
    '/___status',
    express.static(path.resolve(__dirname, '../../publisher-ui/dist')),
  );

  getConfig().proxy?.forEach(({ prefix, target }) => {
    app.use(
      prefix,
      authMiddleware,
      createProxyMiddleware({
        target,
        changeOrigin: true,
      }),
    );
  });

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

  app.use(
    '/',
    authMiddleware,
    createProxyMiddleware(() => app.locals.isReady, {
      target: `http://127.0.0.1:${getConfig().commands.serve.port}`,
      selfHandleResponse: true,
      onProxyRes: responseInterceptor(async (responseBuffer, proxyRes) => {
        if (!proxyRes.headers['content-type']?.includes('text/html')) {
          return responseBuffer;
        }
        const response = responseBuffer.toString('utf8');
        return response
          .replace(
            '</head>',
            '<script src="/___status/elements.js"></script></head>',
          )
          .replace(
            '</body>',
            '<publisher-floater><publisher-status /></publisher-floater></body>',
          );
      }),
    }),
  );

  const host = '0.0.0.0';
  const port = getConfig().publisherPort;
  const server = await app.listen({ host, port });
  const terminator = createHttpTerminator({ server });
  console.log(`Server started on http://${host}:${port}`);
  return terminator;
};

export { runServer };
