import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import colors from 'colors';
import cors from 'cors';
import { cosmiconfigSync } from 'cosmiconfig';
import express from 'express';
import basicAuth from 'express-basic-auth';
import expressWs from 'express-ws';
import {
  createProxyMiddleware,
  responseInterceptor,
} from 'http-proxy-middleware';
import { createHttpTerminator } from 'http-terminator';
import morgan from 'morgan';
import * as path from 'path';
import { filter, shareReplay, Subject } from 'rxjs';

import { BuildService } from './server/build';
import {
  GatewayCommands,
  GatewayService,
  isGatewayState,
} from './server/gateway';
import { buildReport, gatewayReport } from './server/history';
import {
  buildStatusLogs,
  gatewayStatusLogs,
  statusUpdates,
} from './server/logging';
import { GatewayState } from './states';

const ews = expressWs(express());
const { app } = ews;
app.use(morgan('dev'));

const explorerSync = cosmiconfigSync('publisher');
const loadedConfig = explorerSync.search();
const config = {
  cleanCommand: 'yarn clean',
  startCommand: 'yarn start',
  startRetries: 3,
  readyPattern: /http:\/\/.*?:3000/,
  buildCommand: 'yarn build',
  buildBufferTime: 500,
  buildRetries: 3,
  gatewayPort: 3001,
  applicationPort: 3000,
  databaseUrl: '/tmp/publisher.db',
  ...(loadedConfig?.config || {}),
};

const gatewayCommands$ = new Subject<GatewayCommands>();
const buildEvents$ = new Subject<{}>();

const def = `
    create table if not exists Build(id INTEGER not null primary key autoincrement, startedAt INTEGER not null,finishedAt INTEGER not null, success BOOLEAN not null, type TEXT not null, logs TEXT not null);`;

execSync(`sqlite3 ${config.databaseUrl} "${def}"`);

const prisma = new PrismaClient({
  datasources: { local: { url: `file:${config.databaseUrl}` } },
});

const gateway$ = gatewayCommands$.pipe(
  GatewayService(config),
  shareReplay(100),
);

app.locals.isReady = false;

// Basic Authentication
if (config.basicAuth) {
  app.use(
    basicAuth({
      users: { [config.basicAuth.username]: config.basicAuth.password },
      challenge: true,
    }),
  );
}

// Allow cross-origin requests
// Default config:
//{
//   "origin": "*",
//   "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
//   "preflightContinue": false,
//   "optionsSuccessStatus": 204
// }
app.use(cors());

app.use(function (req, res, next) {
  res.set('Cache-control', 'no-cache');
  next();
});

gateway$.pipe(filter(isGatewayState)).subscribe((state) => {
  app.locals.isReady = state === GatewayState.Ready;
});

gateway$.pipe(gatewayReport()).subscribe(async (data) => {
  await prisma.build.create({ data });
});

const builder$ = buildEvents$.pipe(BuildService(config), shareReplay(100));
builder$.pipe(buildReport()).subscribe(async (data) => {
  await prisma.build.create({ data });
});

app.post('/___status/build', (req, res) => {
  buildEvents$.next(req.body);
  res.json(true);
});

app.post('/___status/clean', (req, res) => {
  gatewayCommands$.next('clean');
  res.json(true);
});

app.ws('/___status/gateway/logs', (ws) => {
  const sub = gatewayStatusLogs(gateway$).subscribe((data) => {
    ws.send(data.chunk);
  });
  ws.on('close', sub.unsubscribe);
});

app.ws('/___status/builder/logs', (ws) => {
  const sub = buildStatusLogs(builder$).subscribe((data) => {
    ws.send(data.chunk);
  });
  ws.on('close', sub.unsubscribe);
});

app.ws('/___status/updates', (ws) => {
  const sub = statusUpdates(gateway$, builder$).subscribe((data) => {
    ws.send(JSON.stringify(data));
  });

  ws.on('close', sub.unsubscribe);
});

app.get('/___status/history', async (req, res) => {
  const result = await prisma.build.findMany({
    select: {
      id: true,
      success: true,
      startedAt: true,
      finishedAt: true,
      type: true,
    },
    orderBy: { id: 'desc' },
    take: 10,
  });
  res.json(result);
});

app.get('/___status/history/:id', async (req, res) => {
  const result = await prisma.build.findFirst({
    where: {
      id: parseInt(req.params.id),
    },
  });
  res.json(result);
});

app.use('/___status', express.static(path.resolve(__dirname, '../dist')));

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
  createProxyMiddleware(() => app.locals.isReady, {
    target: `http://127.0.0.1:${config.applicationPort}`,
    selfHandleResponse: true,
    onProxyRes: responseInterceptor(async (responseBuffer) => {
      const response = responseBuffer.toString('utf8');
      return response
        .replace(
          '</head>',
          '<script src="/___status/refresh.js"></script></head>',
        )
        .replace('</body>', '<publisher-refresh/></body>');
    }),
  }),
);

const server = app.listen(config.gatewayPort);
const terminator = createHttpTerminator({ server });
const sub = gateway$.subscribe();
gatewayCommands$.next('start');

process.on('SIGINT', function () {
  console.log(colors.bgMagenta('⏱ Stopping publisher service.'));
  sub.unsubscribe();
  return terminator.terminate().then(() => {
    console.log(colors.bgCyan('🛑 Publisher service stopped.'));
    return process.exit();
  });
});
