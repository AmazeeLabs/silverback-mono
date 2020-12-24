import axios from 'axios';
import { execSync } from 'child_process';
import express from 'express';
import fs from 'fs';
import PQueue from 'p-queue';
import { archiveFolder } from 'zip-lib';

const app = express();

const queue = new PQueue({ concurrency: 1 });

const buildAndDeployToNetlify = async () => {
  console.log('Building...');
  execSync('yarn build', { stdio: 'inherit' });

  console.log('Zipping...');
  try {
    fs.unlinkSync('deploy.zip');
  } catch (e) {} // eslint-disable-line
  await archiveFolder('public', 'deploy.zip');

  console.log('Deploying...');
  try {
    await axios.post(
      'https://api.netlify.com/api/v1/sites/b02798d6-7fcf-4795-88a8-646767aaf890/deploys',
      fs.createReadStream('deploy.zip'),
      {
        headers: {
          'Content-Type': 'application/zip',
          Authorization: 'Bearer ' + process.env.NETLIFY_TOKEN,
        },
      },
    );
    console.log('Done!');
  } catch (e) {
    console.error('Failed to deploy.', e.message, e.response);
  }
};

app.post('/__rebuild', (_, res) => {
  res.send('Will rebuild now!');
  queue.add(buildAndDeployToNetlify);
});

app.listen(3000, () => {
  buildAndDeployToNetlify();
  console.log('The rebuild endpoint is ready at /__rebuild');
});
