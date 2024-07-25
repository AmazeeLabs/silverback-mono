import { state } from './state';
import { buildTask } from './tasks/build';
import { cleanRunTask } from './tasks/clean/cleanRun';
import { serveStopTask } from './tasks/serve/serveStop';
import { OutputSubject } from './tools/output';
import { Queue } from './tools/queue';
import { Process } from './tools/runner';

class Core {
  state = state;

  serveProcess: Process | null = null;

  output$ = new OutputSubject();

  queue = new Queue();

  start = (options?: { skipInitialBuild?: boolean }): void => {
    this.queue.add({ job: buildTask(options) });
    this.queue.run();
  };

  stop = async (): Promise<void> => {
    await this.queue.clear();
    await this.serveProcess?.kill();
  };

  build = (): void => {
    // Consider any pending task a build task.
    if (!this.queue.hasPendingTasks()) {
      this.queue.add({ job: buildTask() });
    }
  };

  clean = async (): Promise<void> => {
    await this.queue.clear();
    this.state.reset();
    this.queue.add({ job: serveStopTask });
    this.queue.add({ job: cleanRunTask });
    this.queue.add({ job: buildTask() });
  };
}

export const core = new Core();
