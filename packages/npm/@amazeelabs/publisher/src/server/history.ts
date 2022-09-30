import { filter, map, Observable, scan, Timestamp, timestamp } from 'rxjs';

import { BuildState, GatewayState } from '../states';
import { BuildOutput, isBuildState } from './build';
import { GatewayOutput, isGatewayState } from './gateway';
import { isSpawnChunk, SpawnChunk } from './spawn';

export type HistoryEntry = {
  id: number;
  startedAt: number;
  finishedAt: number;
  success: boolean;
  type: string;
  logs: string;
};

type ReportAggregate<T extends GatewayOutput | BuildOutput> = Omit<
  HistoryEntry,
  'logs'
> & {
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
  ): Observable<HistoryEntry> {
    return source$.pipe(
      map(({ logs, state, ...input }) => ({
        ...input,
        type,
        success: state === BuildState.Finished,
        logs: JSON.stringify(logs),
      })),
    );
  };
}

export function finalizeGatewayReport(type: string) {
  return function (
    source$: Observable<ReportAggregate<any>>,
  ): Observable<HistoryEntry> {
    return source$.pipe(
      map(({ logs, state, ...input }) => ({
        ...input,
        type,
        success: state === GatewayState.Ready,
        logs: JSON.stringify(logs),
      })),
    );
  };
}

export function buildReport() {
  return function (source$: Observable<BuildOutput>): Observable<HistoryEntry> {
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
  ): Observable<HistoryEntry> {
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
