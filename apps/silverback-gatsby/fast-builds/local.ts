import { execSync, spawn } from 'child_process';

console.log('Killing `pnpm serve`');
try {
  execSync('pkill -f ":9000" || true', { stdio: 'inherit' });
} catch (e) {
  // This is fine.
}

console.log('Running `pnpm build:gatsby`');
execSync('pnpm build:gatsby', { stdio: 'inherit' });

console.log('Running `pnpm serve`');
const child = spawn('pnpm serve', {
  detached: true,
  cwd: process.cwd(),
  env: process.env,
  shell: true,
  stdio: 'ignore',
});
child.unref();
