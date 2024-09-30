import { ApplicationState } from '@amazeelabs/publisher-shared';
import { BehaviorSubject, Subject } from 'rxjs';

import { Core } from '../tools/core';
import { OutputSubject } from '../tools/output';
import { Queue } from '../tools/queue';
import { buildTask } from './build';

type WorkflowState = 'unknown' | 'started' | 'success' | 'failure';

class CoreGithubWorkflow implements Core {
  state = {
    applicationState$: new Subject<ApplicationState>(),
    buildNumber: 0,
    workflowState$: new BehaviorSubject<WorkflowState>('unknown'),
    workflowRunUrl: '',
  };

  output$ = new OutputSubject();

  queue = new Queue();

  start = () => {
    this.queue.run();
  };

  stop = async () => {
    await this.queue.clear();
  };

  build = (): void => {
    // Consider any pending task a build task.
    if (!this.queue.hasPendingTasks()) {
      this.queue.add({ job: buildTask() });
    }
  };

  clean = async (): Promise<void> => {
    await this.queue.clear();
    this.queue.add({ job: buildTask({ clean: true }) });
  };
}

const core = new CoreGithubWorkflow();
core.state.applicationState$.next(ApplicationState.Starting);

export { core };
