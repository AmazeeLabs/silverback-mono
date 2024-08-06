import { clearConfig, PublisherConfigLocal } from '../../tools/config';
import { OutputSubject } from '../../tools/output';
import { Queue, TaskController } from '../../tools/queue';
import { core } from '../core';
import { serveStopTask } from '../tasks/serve/serveStop';

export const reset = async (): Promise<void> => {
  await serveStopTask(new TaskController());
  await core.queue.clear();
  core.queue = new Queue();
  core.output$ = new OutputSubject();
  core.state.reset();
  clearConfig();
};

export const defaultConfig: PublisherConfigLocal = {
  publisherPort: 3000,
  mode: 'local',
  commands: {
    clean: 'echo "clean"',
    build: {
      command: 'echo "build"',
    },
    deploy: 'echo "deploy"',
    serve: {
      command: 'echo "serve"; while true; do sleep 86400; done',
      readyPattern: 'serve',
      port: 3001,
    },
  },
  databaseUrl: 'sqlite://:memory:',
};
