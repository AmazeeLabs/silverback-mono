export enum ApplicationState {
  /**
   * The application is starting and not yet available.
   */
  Starting = 'starting',
  /**
   * A fatal error during startup happened, application is not available.
   */
  Fatal = 'fatal',
  /**
   * A build error happened. Application is still available, but not up-to-date.
   */
  Error = 'error',
  /**
   * Application is updating, but still available.
   */
  Updating = 'updating',
  /**
   * Application is up-to-date.
   */
  Ready = 'ready',
}

export type BuildModel = {
  id: number;
  startedAt: number;
  finishedAt: number;
  success: boolean;
  type: 'incremental' | 'full';
  logs: string;
};
