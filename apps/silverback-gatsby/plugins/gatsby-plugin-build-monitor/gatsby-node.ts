// TODO: Add axios to package.json in case if this plugin will be extracted.
import axios from 'axios';
import { GatsbyNode } from 'gatsby';

export const sourceNodes = async () => {
  if (!process.env.ENABLE_GATSBY_REFRESH_ENDPOINT) {
    return;
  }

  axios.post(process.env.DRUPAL_BUILD_MONITOR_ENDPOINT! + 'rebuilding');
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
        axios.post(process.env.DRUPAL_BUILD_MONITOR_ENDPOINT! + 'idle');
      }
    }, timeout);
  };

  args.store.subscribe(watchStore);
};
