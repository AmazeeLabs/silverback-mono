import { expect } from 'chai';
import { stub } from 'sinon';

import { Actor } from '../actor';
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
      a();
    }
  }

  class UseB {
    public b() {
      b();
    }
  }

  const MyTask: Task<undefined> = [
    createTask(UseA, (a) => {
      a.a();
    }),
    createTask(UseB, (b) => {
      b.b();
    }),
  ];

  it('executes an interaction to fulfill a task', () => {
    const actor = new Actor([new UseA()]);
    actor.perform(MyTask, undefined);
    expect(a.callCount).to.equal(1);
    expect(b.callCount).to.equal(0);
  });

  it('raises an exception if there is no supported interaction', () => {
    const actor = new Actor([new WorthlessAbility()]);
    expect(() => {
      actor.perform(MyTask, undefined);
    }).to.throw(UnsupportedTaskError);
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
