import { expect, test } from 'vitest';

import { Queue, Task, TaskResult } from './queue';

test('queue can be cleared', async () => {
  // I could not make it work with fake timers :(

  const log: string[] = [];

  const queue = new Queue();

  const task: (number: number) => Task = (number) => ({
    job: async (controller): TaskResult => {
      log.push(`task ${number} start`);
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          log.push(`task ${number} resolve`);
          resolve(true);
        }, 200);
        controller.onCancel(() => {
          log.push(`task ${number} cancel`);
          clearTimeout(timeout);
          resolve(false);
        });
      });
    },
  });

  queue.add(task(1));
  queue.add(task(2));
  queue.add(task(3));

  expect(queue.hasPendingTasks()).toBe(true);

  queue.run();

  setTimeout(() => {
    log.push('clear');
    queue.clear();
  }, 300);

  await queue.whenIdle;

  expect(queue.hasPendingTasks()).toBe(false);
  expect(log).toStrictEqual([
    'task 1 start',
    'task 1 resolve',
    'task 2 start',
    'clear',
    'task 2 cancel',
  ]);
});

test('shouldStopQueueOnFailure option', async () => {
  const log: string[] = [];

  const queue = new Queue();

  queue.add({
    job: async (): TaskResult => {
      log.push('success');
      return true;
    },
    options: { shouldStopQueueOnFailure: true },
  });

  queue.add({
    job: async (): TaskResult => {
      log.push('failure');
      return false;
    },
    options: { shouldStopQueueOnFailure: true },
  });

  queue.add({
    job: async (): TaskResult => {
      log.push('should not be called');
      return true;
    },
    options: { shouldStopQueueOnFailure: true },
  });

  queue.run();
  await queue.whenIdle;

  expect(log).toStrictEqual(['success', 'failure']);
  expect(queue.hasPendingTasks()).toBe(false);
  expect(queue.hasActiveTasks()).toBe(false);
});
