import { state } from './state';
import { buildTask } from './tasks/build';
import { buildLoadTask } from './tasks/build/buildLoad';
import { buildSaveTask } from './tasks/build/buildSave';
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

  buildSave = (): void => {
    if (core.queue.hasPendingTasks() || core.queue.hasActiveTasks()) {
      throw new Error('Cannot save a build while queue is running.');
    }
    this.queue.add({ job: buildSaveTask });
    this.queue.run();
  };

  buildLoad = (): void => {
    if (core.queue.hasPendingTasks() || core.queue.hasActiveTasks()) {
      throw new Error('Cannot load a build while queue is running.');
    }
    this.queue.add({ job: buildLoadTask });
    this.queue.run();
  };
}

export const core = new Core();
