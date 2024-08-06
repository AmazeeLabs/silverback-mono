import { ApplicationState } from '@amazeelabs/publisher-shared';
import { distinctUntilChanged, Observable } from 'rxjs';
import { createStore } from 'zustand/vanilla';

type ProcessState = 'NotStarted' | 'InProgress' | 'Success' | 'Error';

type State = {
  buildNumber: number;
  buildState: {
    buildJob: ProcessState;
    deployJob: ProcessState;
    overall: 'NotStarted' | 'InProgress' | 'Done';
  };
  cleanState: ProcessState;
};

const initialState: State = {
  buildNumber: 0,
  buildState: {
    buildJob: 'NotStarted',
    deployJob: 'NotStarted',
    overall: 'NotStarted',
  },
  cleanState: 'NotStarted',
};

const store = createStore<State>(() => initialState);

export const state = {
  getBuildNumber: (): number => store.getState().buildNumber,

  setBuildNumber: (buildNumber: number): void => {
    store.setState({ buildNumber });
  },

  incrementBuildNumber: (): void =>
    store.setState({ buildNumber: store.getState().buildNumber + 1 }),

  setBuildState: (state: State['buildState']['overall']): void => {
    store.setState((currentState) => ({
      buildState: { ...currentState.buildState, overall: state },
    }));
  },

  getBuildJobState: (): State['buildState']['buildJob'] =>
    store.getState().buildState.buildJob,

  setBuildJobState: (state: State['buildState']['buildJob']): void => {
    store.setState((currentState) => ({
      buildState: { ...currentState.buildState, buildJob: state },
    }));
  },

  getDeployJobState: (): State['buildState']['deployJob'] =>
    store.getState().buildState.deployJob,

  setDeployJobState: (state: State['buildState']['deployJob']): void => {
    store.setState((currentState) => ({
      buildState: { ...currentState.buildState, deployJob: state },
    }));
  },

  setCleanState: (state: State['cleanState']): void => {
    store.setState({ cleanState: state });
  },

  applicationState$: new Observable<ApplicationState>((subscriber) => {
    const unsubscribe = store.subscribe((state) =>
      subscriber.next(computeApplicationState(state)),
    );
    return (): void => unsubscribe();
  }).pipe(distinctUntilChanged()),

  reset: (): void => store.setState(initialState),
};

const computeApplicationState = ({
  buildState: { buildJob, deployJob, overall: buildOverall },
  cleanState: cleanJob,
  buildNumber,
}: State): ApplicationState => {
  if (buildOverall === 'NotStarted') {
    return ApplicationState.Starting;
  }
  if (buildOverall === 'InProgress') {
    return buildNumber === 1
      ? ApplicationState.Starting
      : ApplicationState.Updating;
  }
  if (cleanJob === 'InProgress') {
    return ApplicationState.Starting;
  }
  if (buildJob === 'Error' || deployJob === 'Error' || cleanJob === 'Error') {
    return buildNumber === 1 ? ApplicationState.Fatal : ApplicationState.Error;
  }
  if (
    buildOverall === 'Done' &&
    buildJob === 'Success' &&
    deployJob === 'Success'
  ) {
    return ApplicationState.Ready;
  }
  return ApplicationState.Error;
};
