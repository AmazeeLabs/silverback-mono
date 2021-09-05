import { isIframeCommand } from '../iframe-command';

const sets = [
  {
    case: 'undefined',
    data: {},
    result: false,
  },
  {
    case: 'function',
    data: () => {},
    result: false,
  },
  {
    case: 'empty object',
    data: {},
    result: false,
  },
  {
    case: 'unknown action',
    data: { action: 'bob' },
    result: false,
  },
  {
    case: 'getBaseUrl',
    data: { action: 'getBaseUrl' },
    result: true,
  },
  {
    case: 'redirect with no path',
    data: { action: 'redirect' },
    result: false,
  },
  {
    case: 'redirect with bad path',
    data: { action: 'redirect', path: {} },
    result: false,
  },
  {
    case: 'redirect without messages',
    data: { action: 'redirect', path: '/foo' },
    result: true,
  },
  {
    case: 'redirect with bad messages',
    data: { action: 'redirect', path: '/foo', messages: {} },
    result: false,
  },
  {
    case: 'redirect with bad message',
    data: { action: 'redirect', path: '/foo', messages: ['bar', {}] },
    result: false,
  },
  {
    case: 'redirect with messages',
    data: { action: 'redirect', path: '/foo', messages: ['bar', 'baz'] },
    result: true,
  },
  {
    case: 'replaceWithMessages without messages',
    data: { action: 'replaceWithMessages' },
    result: false,
  },
  {
    case: 'replaceWithMessages with messages',
    data: { action: 'replaceWithMessages', messages: ['foo'] },
    result: true,
  },
  {
    case: 'displayMessages without messages',
    data: { action: 'displayMessages' },
    result: false,
  },
  {
    case: 'displayMessages with messages',
    data: { action: 'displayMessages', messages: ['foo'] },
    result: true,
  },
];

describe.each(sets)('isIframeCommand', (set) => {
  it(`Case "${set.case}" should ${set.result ? 'pass' : 'fail'}`, () => {
    expect(isIframeCommand(set.data)).toBe(set.result);
  });
});
