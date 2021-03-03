import axios from 'axios';
import { execSync } from 'child_process';
import express from 'express';
import PQueue from 'p-queue';

const stripAnsi = require('strip-ansi');

const port = parseInt(process.argv[2]);
if (!port) {
  throw new Error('Please pass the port number.');
}
const script = process.argv[3];
if (!['local', 'netlify'].includes(script)) {
  throw new Error('Please pass the script.');
}

const app = express();

const queue = new PQueue({ concurrency: 1 });

const buildAndDeploy = async () => {
  const started = new Date().toISOString();
  console.log('Fast-Build: Starting...', started);

  await setState({ process: 'build', status: 'building' });

  let output: string;
  try {
    output = execSync(`yarn fast-builds:run:${script} 2>&1`).toString();
  } catch (e) {
    output = e.stdout.toString();
  }
  output = stripAnsi(output);

  const finished = new Date().toISOString();
  await setState({
    process: 'build',
    status: 'idle',
    buildStats: {
      started,
      finished,
      output,
    },
  });

  console.log('Fast-Build: Finished!', finished, output);
};

app.post('/__rebuild', (_, res) => {
  res.send('Will rebuild now!');
  // Only add to to queue if we have no pending build requests.
  if (!queue.pending) {
    queue.add(buildAndDeploy);
  }
});

app.listen(port, () => {
  console.log(`The rebuild endpoint is ready at :${port}/__rebuild`);
  queue.add(buildAndDeploy);
});

type Payload =
  | {
      process: 'build';
      status: 'building';
    }
  | {
      process: 'build';
      status: 'idle';
      buildStats: {
        started: string;
        finished: string;
        output: string;
      };
    };

const setState = async (payload: Payload) => {
  if (
    !process.env.GATSBY_PLUGIN_BUILD_MONITOR_ENDPOINT ||
    !process.env.GATSBY_PLUGIN_BUILD_MONITOR_TOKEN
  ) {
    console.warn('Warning: Gatsby plugin build monitor env vars are not set.');
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
      'Warning: Cannot call gatsby plugin build monitor endpoint',
      e.toString(),
    );
    console.debug(e);
  }
};
