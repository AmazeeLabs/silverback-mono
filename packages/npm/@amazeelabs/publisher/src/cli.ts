import { HttpTerminator } from 'http-terminator/src/types';

import { runServer } from './server';
import { core } from './tools/core';
import { initDatabase } from './tools/database';

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

  case 'help':
  case '--help':
    console.log(`Usage: pnpm publisher [command]

Available commands:

(no command): Start the server.
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
