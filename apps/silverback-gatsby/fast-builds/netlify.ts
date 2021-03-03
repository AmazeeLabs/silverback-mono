import { execSync } from 'child_process';
import NetlifyAPI from 'netlify';

const statusCallback: NetlifyStatusCallback = ({ type, msg, phase }) => {
  if (phase === 'start' || phase === 'stop') {
    console.log(`Netlify: [${type}] (${phase}) ${msg}`);
  } else if (phase === 'progress') {
    // It generates too many messages of "progress" type. Ignore them.
  }
};

console.log('Building...');
try {
  execSync('yarn build', { stdio: 'inherit' });
} catch (e) {
  console.error('Failed to build.', e);
}

console.log('Deploying...');
const client = new NetlifyAPI(process.env.NETLIFY_TOKEN);
client
  .deploy('b02798d6-7fcf-4795-88a8-646767aaf890', 'public', {
    statusCb: statusCallback,
  })
  // eslint-disable-next-line promise/always-return
  .then(() => {
    console.log('Done!');
  })
  .catch((e: unknown) => {
    console.error('Failed to deploy.', e);
  });

type NetlifyStatusCallback = (status: {
  type: string;
  msg: string;
  phase: 'start' | 'progress' | 'stop';
}) => void;
