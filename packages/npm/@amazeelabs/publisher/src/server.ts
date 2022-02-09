import express from 'express';
import expressWs from 'express-ws';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { negate } from 'lodash';
import morgan from 'morgan';
import {
  combineLatestWith,
  filter,
  scan,
  shareReplay,
  startWith,
  Subject,
} from 'rxjs';

import { BuildService, BuildState, isQueueStatus } from './server/build';
import {
  GatewayCommands,
  GatewayService,
  GatewayState,
  isGatewayState,
} from './server/gateway';
import { isSpawnChunk } from './server/spawn';

const ews = expressWs(express());
const { app } = ews;
app.use(morgan('dev'));

const gatewayCommands$ = new Subject<GatewayCommands>();
const buildEvents$ = new Subject<{}>();

const gateway$ = GatewayService(
  {
    cleanCommand: 'test/clean.sh',
    startCommand: 'test/start.sh',
    startRetries: 3,
    readyPattern: /http:\/\/localhost:3002/,
  },
  gatewayCommands$,
).pipe(shareReplay(100));

const builder$ = BuildService(
  {
    buildBufferTime: 500,
    buildCommand: 'test/build.sh',
    buildRetries: 3,
  },
  buildEvents$,
).pipe(shareReplay(100));

app.post('/___status/build', (req, res) => {
  buildEvents$.next(req.body);
  res.json(true);
});

app.post('/___status/clean', (req, res) => {
  gatewayCommands$.next('clean');
  res.json(true);
});

app.ws('/___status/gateway/logs', (ws) => {
  const sub = gateway$.pipe(filter(isSpawnChunk)).subscribe((data) => {
    ws.send(data.chunk);
  });
  ws.on('close', sub.unsubscribe);
});

app.ws('/___status/builder/logs', (ws) => {
  const sub = builder$.pipe(filter(isSpawnChunk)).subscribe((data) => {
    ws.send(data.chunk);
  });
  ws.on('close', sub.unsubscribe);
});

app.ws('/___status/updates', (ws) => {
  const sub = gateway$
    .pipe(
      filter(isGatewayState),
      combineLatestWith(
        builder$.pipe(filter(negate(isSpawnChunk)), startWith(BuildState.Init)),
      ),
      scan(
        (acc, [gateway, builder]) => {
          return isQueueStatus(builder)
            ? {
                ...acc,
                gateway,
                queue: builder,
              }
            : {
                ...acc,
                gateway,
                builder,
              };
        },
        {
          builder: BuildState.Finished,
          gateway: GatewayState.Starting,
          queue: [] as Array<any>,
        },
      ),
      shareReplay(1),
    )
    .subscribe((data) => {
      ws.send(JSON.stringify(data));
    });

  ws.on('close', sub.unsubscribe);
});

app.use('/___status', express.static('dist'));

let isReady = false;

gateway$.pipe(filter(isGatewayState)).subscribe((state) => {
  isReady = state === GatewayState.Ready;
  console.log(isReady);
});

app.get('/', (req, res, next) => {
  console.log(isReady);
  if (!isReady) {
    res.redirect(302, `/___status/status.html?dest=${req.originalUrl}`);
    res.send();
  }
  next();
});

app.use(
  '/',
  createProxyMiddleware({
    target: 'http://127.0.0.1:3002',
  }),
);

app.listen(3001);
gateway$.subscribe();
gatewayCommands$.next('start');
