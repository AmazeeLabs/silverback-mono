import express, { Express } from 'express';
import { GatsbyNode } from 'gatsby';

let refreshing = true;

export const onCreateDevServer: GatsbyNode['onCreateDevServer'] = (args) => {
  if (!process.env.ENABLE_GATSBY_REFRESH_ENDPOINT) {
    return;
  }

  const app = args.app as Express;

  const path = '/__is_refreshing';
  app.use(path, express.json());
  app.post(path, (_, res) => {
    res.send(refreshing);
  });
};

export const sourceNodes = async () => {
  if (!process.env.ENABLE_GATSBY_REFRESH_ENDPOINT) {
    return;
  }

  refreshing = true;
};

export const onPostBootstrap: GatsbyNode['onPostBootstrap'] = (args) => {
  if (!process.env.ENABLE_GATSBY_REFRESH_ENDPOINT) {
    return;
  }

  const timeout = 2_000;

  let timeoutId: NodeJS.Timer | null = null;
  let lastActionType: string;

  const watchStore = async (): Promise<void> => {
    const state = await args.store.getState();
    lastActionType = state.lastAction.type;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      if (
        [
          // One of these two is the last ones in case if __refresh detected no
          // new source data to fetch.
          'PAGE_QUERY_RUN',
          'QUERY_EXTRACTED',
          // Otherwise, this one is the last one.
          'CLEAR_PENDING_PAGE_DATA_WRITE',
        ].includes(lastActionType)
      ) {
        refreshing = false;
      }
    }, timeout);
  };

  args.store.subscribe(watchStore);
};
