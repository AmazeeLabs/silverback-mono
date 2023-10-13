import { existsSync } from 'fs';
import { HttpTerminator } from 'http-terminator/src/types';
import { join } from 'path';
import { loadSync } from 'ts-import';

import { core } from './core/core';
import { getConfig, setConfig } from './core/tools/config';
import { initDatabase } from './core/tools/database';
import { runServer } from './server';

const configPath = join(process.cwd(), 'publisher.config.ts');
if (!existsSync(configPath)) {
  console.error(`Publisher config not found: ${configPath}`);
  process.exit(1);
}
const config = loadSync(configPath, {
  compiledJsExtension: '.cjs',
}).default;
setConfig(config);

core.output$.subscribe((chunk) => {
  process.stdout.write(chunk);
});

let serverTerminator: HttpTerminator | null = null;

const command = process.argv[2];
switch (command) {
  case undefined:
    await initDatabase();
    serverTerminator = await runServer();
    core.start();
    break;

  case 'build-save':
    if (!getConfig().persistentBuilds) {
      console.error('Persistent builds are not configured.');
      process.exit(1);
    }
    core.buildSave();
    break;

  case 'build-load':
    if (!getConfig().persistentBuilds) {
      console.error('Persistent builds are not configured.');
      process.exit(1);
    }
    core.buildLoad();
    break;

  case 'help':
  case '--help':
    console.log(`Usage: pnpm publisher [command]

Available commands:

(no command): Start the server.

build-save: Save the build. Copy persistentBuilds.buildPaths directories to persistentBuilds.saveTo dir.

build-load: Load the build. Restore persistentBuilds.buildPaths directories from persistentBuilds.saveTo dir.
`);
    break;

  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}

process.on('SIGINT', async () => {
  if (serverTerminator) {
    await serverTerminator.terminate();
  }
  await core.stop();
  process.exit();
});
