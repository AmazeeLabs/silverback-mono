import { Prisma } from '@prisma/client';
import { filter, map, Observable, scan, Timestamp, timestamp } from 'rxjs';

import { BuildOutput, BuildState, isBuildState, isQueueStatus } from './build';
import { GatewayOutput, GatewayState, isGatewayState } from './gateway';
import { isSpawnChunk, SpawnChunk } from './spawn';

type ReportAggregate<T extends GatewayOutput | BuildOutput> = Omit<
  Prisma.BuildCreateInput,
  'logs' | 'payload'
> & {
  payload: any;
  logs: Array<SpawnChunk & { timestamp: number }>;
  state: T;
};

export function isReportFinished<T extends GatewayOutput | BuildOutput>(
  partial: Partial<ReportAggregate<T>>,
): partial is ReportAggregate<T> {
  return typeof partial.finishedAt === 'number';
}

export function finalizeBuildReport(type: string) {
  return function (
    source$: Observable<ReportAggregate<any>>,
  ): Observable<Prisma.BuildCreateInput> {
    return source$.pipe(
      map(({ logs, state, payload, ...input }) => ({
        ...input,
        type,
        success: state === BuildState.Finished,
        logs: JSON.stringify(logs),
        payload: JSON.stringify(payload),
      })),
    );
  };
}

export function finalizeGatewayReport(type: string) {
  return function (
    source$: Observable<ReportAggregate<any>>,
  ): Observable<Prisma.BuildCreateInput> {
    return source$.pipe(
      map(({ logs, state, payload, ...input }) => ({
        ...input,
        type,
        success: state === GatewayState.Ready,
        logs: JSON.stringify(logs),
        payload: JSON.stringify(payload),
      })),
    );
  };
}

export function buildReport() {
  return function (
    source$: Observable<BuildOutput>,
  ): Observable<Prisma.BuildCreateInput> {
    return source$.pipe(
      timestamp(),
      scan<Timestamp<BuildOutput>, Partial<ReportAggregate<BuildOutput>>>(
        (acc, item) => {
          if (isBuildState(item.value) && acc.state !== item.value) {
            if (item.value === BuildState.Finished) {
              return {
                ...acc,
                success: true,
                finishedAt: item.timestamp,
                state: item.value,
              };
            }

            if (item.value === BuildState.Failed) {
              return {
                ...acc,
                success: false,
                finishedAt: item.timestamp,
                state: item.value,
              };
            }

            if (item.value === BuildState.Running) {
              return {
                logs: [],
                state: item.value,
                startedAt: item.timestamp,
              };
            }
          }

          if (isQueueStatus(item.value)) {
            return {
              ...acc,
              payload: item.value,
            };
          }

          if (isSpawnChunk(item.value)) {
            return {
              ...acc,
              logs: [
                ...(acc.logs || []),
                { ...item.value, timestamp: item.timestamp },
              ],
            };
          }
          return acc;
        },
        {
          logs: [],
          state: BuildState.Init,
        },
      ),
      filter(isReportFinished),
      finalizeBuildReport('incremental'),
    );
  };
}

export function gatewayReport() {
  return function (
    source$: Observable<GatewayOutput>,
  ): Observable<Prisma.BuildCreateInput> {
    return source$.pipe(
      timestamp(),
      scan<Timestamp<GatewayOutput>, Partial<ReportAggregate<GatewayOutput>>>(
        (acc, item) => {
          if (isGatewayState(item.value) && acc.state !== item.value) {
            if (item.value === GatewayState.Ready) {
              return {
                ...acc,
                success: true,
                finishedAt: item.timestamp,
                state: item.value,
              };
            }

            if (item.value === GatewayState.Error) {
              return {
                ...acc,
                success: false,
                finishedAt: item.timestamp,
                state: item.value,
              };
            }

            if (item.value === GatewayState.Starting) {
              return {
                logs: [],
                state: item.value,
                startedAt: item.timestamp,
              };
            }
          }

          if (isSpawnChunk(item.value)) {
            return {
              ...acc,
              logs: [
                ...(acc.logs || []),
                { ...item.value, timestamp: item.timestamp },
              ],
            };
          }
          return acc;
        },
        {
          logs: [],
          state: GatewayState.Init,
        },
      ),
      filter(isReportFinished),
      finalizeGatewayReport('initial'),
    );
  };
}
