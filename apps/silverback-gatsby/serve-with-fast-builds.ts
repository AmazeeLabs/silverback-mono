import { ChildProcess, exec, execSync } from 'child_process';
import express from 'express';
import PQueue from 'p-queue';

const app = express();
const port = 9001;

const queue = new PQueue({ concurrency: 1 });

let serveProcess: ChildProcess;
const buildAndServe = () => {
  if (serveProcess) {
    console.log('Killing `yarn serve`');
    serveProcess.kill();
  }

  console.log('Running `yarn build`');
  execSync('yarn build', { stdio: 'inherit' });

  console.log('Running `yarn serve`');
  serveProcess = exec('yarn serve');
  serveProcess.stdout?.pipe(process.stdout);
  serveProcess.stderr?.pipe(process.stderr);
};

app.post('/__rebuild', (_, res) => {
  res.send('Will rebuild now!');
  queue.add(buildAndServe);
});

app.listen(port, () => {
  buildAndServe();
  console.log(`The rebuild endpoint is at http://localhost:${port}/__rebuild`);
});
