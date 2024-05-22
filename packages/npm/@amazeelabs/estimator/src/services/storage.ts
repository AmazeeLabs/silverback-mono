import { FileSystem } from '@effect/platform';
import { PlatformError } from '@effect/platform/Error';
import { HttpClientError } from '@effect/platform/Http/ClientError';
import * as Http from '@effect/platform/HttpClient';
import { Schema } from '@effect/schema';
import { ParseError } from '@effect/schema/ParseResult';
import { Context, Data, Effect, Schedule } from 'effect';

import { configuration } from '../effects/configuration.js';
import { Configuration } from '../index.js';

interface IStorage {
  update(
    hash: string,
    timestamp: Date,
    score: number,
  ): Effect.Effect<void, StorageError>;
  status: Effect.Effect<{ score: number; secondsSpent: number }, StorageError>;
}

class StorageError extends Data.TaggedError('StorageError')<{
  msg: string;
}> {
  toString(): string {
    return `StorageError: "${this.msg}"`;
  }
}

const mapPlatformError = (error: PlatformError) =>
  new StorageError({
    msg: `StorageError [${error.module}.${error.method}]: ${error.message}`,
  });

export type Entry = {
  hash: string;
  secondsSpent: number;
  timestamp: Date;
  score: number;
};

export const NullEntry = {
  hash: '',
  score: 0,
  secondsSpent: 0,
  timestamp: new Date(0),
} satisfies Entry;

export const makeStorage = Effect.gen(function* () {
  const config = yield* configuration;
  if (typeof config.storage === 'string') {
    return yield* makeFileStorage(`${config.root}/${config.storage}`);
  }
  return yield* makeHTTPStorage(config.storage);
});

export function serialize(entry: Entry) {
  return JSON.stringify({ ...entry, timestamp: entry.timestamp.getTime() });
}

export function deserialize(line: string) {
  const { timestamp, ...entry } = JSON.parse(line);
  return { ...entry, timestamp: new Date(timestamp) } as Entry;
}

const makeFileStorage = (filepath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const readFileStorage = (filename: string) =>
      Effect.gen(function* () {
        if (yield* fs.exists(filename)) {
          return (yield* fs.readFileString(filename)).split('\n');
        }
        return [];
      });

    return {
      update: (hash: string, timestamp: Date, score: number) =>
        Effect.gen(function* () {
          const content = yield* readFileStorage(filepath);
          const line = serialize({
            hash,
            score,
            timestamp,
            secondsSpent: score * 60,
          });
          yield* fs.writeFileString(filepath, [...content, line].join('\n'));
        }).pipe(Effect.mapError(mapPlatformError)),
      status: Effect.gen(function* () {
        const content = yield* readFileStorage(filepath);
        const entries = content.map(deserialize);
        const entry = entries
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
          .pop();
        if (!entry) {
          return NullEntry;
        }
        return { score: entry.score, secondsSpent: entry.secondsSpent };
      }).pipe(Effect.mapError(mapPlatformError)),
    } as IStorage;
  });

class StatusResponse extends Schema.Class<StatusResponse>('StatusResponse')({
  complexity_score: Schema.Number,
  timelogs_sum: Schema.Number,
}) {}

class UpdateResponse extends Schema.Class<UpdateResponse>('UpdateResponse')(
  {},
) {}

const httpSchedule = Schedule.addDelay(Schedule.recurs(5), () => 1000);

const mapHttpError = (e: ParseError | HttpClientError) =>
  new StorageError({ msg: e.toString() });

const makeHTTPStorage = (
  config: Exclude<Configuration['storage'], string | undefined>,
) =>
  Effect.gen(function* () {
    const client = (yield* Http.client.Client).pipe(
      Http.client.mapRequest(Http.request.prependUrl(config.api)),
      Http.client.mapRequest(
        Http.request.setHeader('Authorization', `Bearer ${config.token}`),
      ),
      Http.client.filterStatusOk,
    );

    return {
      update: (hash: string, timestamp: Date, score: number) => {
        const data = new FormData();
        data.append('id', config.id);
        data.append('complexity_score', score.toString());
        data.append('date', timestamp.toISOString().split('T')[0]);
        data.append('commit_hash', hash);
        const res = Effect.retry(
          Http.request
            .post('/update')
            .pipe(
              Http.request.formDataBody(data),
              client,
              Http.response.schemaBodyJsonScoped(UpdateResponse),
            ),
          httpSchedule,
        ).pipe(Effect.map(() => undefined));
        return res.pipe(Effect.mapError(mapHttpError));
      },
      status: (function () {
        const res = Effect.retry(
          Http.request.get(`/get/${config.id}`).pipe(
            client,
            Http.response.schemaBodyJsonScoped(StatusResponse),
            Effect.map((data) => ({
              score: data.complexity_score,
              secondsSpent: data.timelogs_sum,
            })),
          ),
          httpSchedule,
        );
        return res.pipe(Effect.mapError(mapHttpError));
      })(),
    } as IStorage;
  });

export class Storage extends Context.Tag('Storage')<Storage, IStorage>() {}
