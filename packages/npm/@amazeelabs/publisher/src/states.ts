/**
 * The primary states a build can be in.
 */
export enum BuildState {
  Init,
  Running,
  Finished,
  Failed,
}

export enum GatewayState {
  Init,
  Starting,
  Cleaning,
  Ready,
  Error,
}

export type StatusUpdate = {
  builder: BuildState;
  gateway: GatewayState;
  queue: Array<any>;
};
