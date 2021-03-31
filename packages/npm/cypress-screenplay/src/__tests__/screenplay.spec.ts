import { expect } from 'chai';
import { stub } from 'sinon';

import { AbilityFactory, Actor } from '../actor';
import { UnsupportedTaskError } from '../errors';
import { createQuestion } from '../question';
import { createTask, Task } from '../task';

class WorthlessAbility {}

describe('Task', () => {
  const a = stub();
  const b = stub();

  beforeEach(() => {
    a.reset();
    b.reset();
  });

  class UseA {
    public a() {
      return new Promise<void>((resolve) =>
        setTimeout(() => {
          a();
          resolve(undefined);
        }, 100),
      );
    }
  }

  class UseB implements AbilityFactory<() => {}> {
    public create() {
      return b;
    }
  }

  const MyTask: Task<undefined> = [
    createTask(UseA, (a) => {
      return a.a();
    }),
    createTask(UseB, (b) => {
      b();
    }),
  ];

  it('executes an interaction to fulfill a task', async () => {
    const actor = new Actor([new UseA()]);
    await actor.perform(MyTask, undefined);
    expect(a.callCount).to.equal(1);
    expect(b.callCount).to.equal(0);
  });

  it('raises an exception if there is no supported interaction', (done) => {
    const actor = new Actor([new WorthlessAbility()]);
    actor.perform(MyTask, undefined).catch((err) => {
      expect(err).instanceof(UnsupportedTaskError);
      // eslint-disable-next-line promise/no-callback-in-promise
      done();
    });
  });

  it('uses the first supported interaction', () => {
    const actor = new Actor([new UseB()]);
    actor.perform(MyTask, undefined);
    expect(a.callCount).to.equal(0);
    expect(b.callCount).to.equal(1);
  });
});

describe('Question', () => {
  class UseUpperCase {
    public toUpperCase(value: string) {
      return value.toUpperCase();
    }
  }

  const transform = createQuestion<UseUpperCase, string, string>(
    UseUpperCase,
    (uppercase, param: string, assert) => {
      assert(uppercase.toUpperCase(param));
    },
  );

  it('executes an interaction to answer a question', () => {
    const actor = new Actor([new UseUpperCase()]);
    actor.ask(transform, 'Foo', (res) => {
      expect(res).to.equal('FOO');
    });
  });
});
