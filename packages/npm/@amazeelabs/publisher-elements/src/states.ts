/**
 * The primary states a build can be in.
 */
export enum BuildState {
  Init,
  Running,
  Finished,
  Failed,
}

/**
 * The Gateway states.
 */
export enum GatewayState {
  Init,
  Starting,
  Cleaning,
  Ready,
  Error,
}

/**
 * Build and Gateway states, combined in one user-focused application state.
 */
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

export type StatusUpdate = {
  builder: BuildState;
  gateway: GatewayState;
  queue: Array<any>;
};

export function mapStatusUpdateToApplicationState({
  builder,
  gateway,
}: Pick<StatusUpdate, 'builder' | 'gateway'>): ApplicationState {
  if (
    [GatewayState.Starting, GatewayState.Cleaning, GatewayState.Init].includes(
      gateway,
    )
  ) {
    return ApplicationState.Starting;
  }
  if (gateway === GatewayState.Error) {
    return ApplicationState.Fatal;
  }
  if ([BuildState.Init, BuildState.Finished].includes(builder)) {
    return ApplicationState.Ready;
  }
  if (builder === BuildState.Failed) {
    return ApplicationState.Error;
  }
  if (builder === BuildState.Running) {
    return ApplicationState.Updating;
  }
  return ApplicationState.Starting;
}
