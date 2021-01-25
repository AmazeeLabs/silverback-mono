import { execSync } from 'child_process';
import express from 'express';
import NetlifyAPI from 'netlify';
import PQueue from 'p-queue';

const app = express();

const queue = new PQueue({ concurrency: 1 });

const buildAndDeployToNetlify = async () => {
  console.log('Building...');
  execSync('yarn build', { stdio: 'inherit' });
  console.log('Deploying...');
  try {
    const client = new NetlifyAPI(process.env.NETLIFY_TOKEN);
    await client.deploy('b02798d6-7fcf-4795-88a8-646767aaf890', 'public', {
      statusCb: statusCallback,
    });
    console.log('Done!');
  } catch (e) {
    console.error('Failed to deploy.', e);
  }
};

app.post('/__rebuild', (_, res) => {
  res.send('Will rebuild now!');
  queue.add(buildAndDeployToNetlify);
});

app.listen(3000, () => {
  console.log('The rebuild endpoint is ready at /__rebuild');
  queue.add(buildAndDeployToNetlify);
});

type NetlifyStatusCallback = (status: {
  type: string;
  msg: string;
  phase: 'start' | 'progress' | 'stop';
}) => void;

const statusCallback: NetlifyStatusCallback = ({ type, msg, phase }) => {
  if (phase === 'start' || phase === 'stop') {
    console.log(`Netlify: [${type}] (${phase}) ${msg}`);
  } else if (phase === 'progress') {
    // It generates too many messages of "progress" type. Ignore them.
  }
};
