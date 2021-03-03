import { execSync, spawn } from 'child_process';

console.log('Killing `yarn serve`');
execSync('pkill -f ":9000" || true', { stdio: 'inherit' });

console.log('Running `yarn build`');
execSync('yarn build', { stdio: 'inherit' });

console.log('Running `yarn serve`');
const child = spawn('yarn serve', {
  detached: true,
  cwd: process.cwd(),
  env: process.env,
  shell: true,
  stdio: 'ignore',
});
child.unref();
