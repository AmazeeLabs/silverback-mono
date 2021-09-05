import axios from 'axios';
import { GatsbyNode } from 'gatsby';

interface Payload {
  process: 'build';
  status: 'building' | 'idle';
}

if (!process.env.GATSBY_PLUGIN_BUILD_MONITOR_ENDPOINT) {
  console.warn('GATSBY_PLUGIN_BUILD_MONITOR_ENDPOINT is not set.');
}
if (!process.env.GATSBY_PLUGIN_BUILD_MONITOR_TOKEN) {
  console.warn('GATSBY_PLUGIN_BUILD_MONITOR_TOKEN is not set.');
}

export const onPreInit: GatsbyNode['onPreInit'] = async (args) => {
  const process =
    args.store.getState()?.lastAction?.type === 'ACTIVITY_START'
      ? 'build'
      : 'unknown';
  if (process === 'build') {
    callEndpoint({
      process,
      status: 'building',
    });
  }
};

export const onPreBuild = async () => {
  // Another call. Because onPreInit implementation is shaky.
  callEndpoint({
    process: 'build',
    status: 'building',
  });
};

export const onPostBuild = async () => {
  // We need to await here because Gatsby can be too fast to kill the process.
  await callEndpoint({
    process: 'build',
    status: 'idle',
  });
};

const callEndpoint = async (payload: Payload) => {
  if (
    !process.env.GATSBY_PLUGIN_BUILD_MONITOR_ENDPOINT ||
    !process.env.GATSBY_PLUGIN_BUILD_MONITOR_TOKEN
  ) {
    return;
  }
  try {
    await axios.post(
      process.env.GATSBY_PLUGIN_BUILD_MONITOR_ENDPOINT,
      payload,
      {
        headers: {
          token: process.env.GATSBY_PLUGIN_BUILD_MONITOR_TOKEN,
        },
      },
    );
  } catch (e) {
    console.warn(
      'Cannot call gatsby plugin build monitor endpoint',
      (e as any).toString(),
    );
    console.debug(e);
  }
};
