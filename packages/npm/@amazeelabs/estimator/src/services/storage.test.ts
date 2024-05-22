import { Effect } from 'effect';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { Configuration } from '../index.js';
import { Storage } from './storage.js';

const api = 'https://dashboard.amazeelabs.com/api/estimator';

const mockUpdate = vi.fn();
const mockStatus = vi.fn();

const server = setupServer(
  http.get(`${api}/get/:id`, () => HttpResponse.error(), { once: true }),
  http.get(`${api}/get/:id`, ({ request }) => {
    if (request.headers.get('Authorization') !== 'Bearer token') {
      return HttpResponse.text('', { status: 401 });
    }
    return HttpResponse.json(mockStatus(), { status: 200 });
  }),
  http.post(`${api}/update`, async ({ request }) => {
    if (request.headers.get('Authorization') !== 'Bearer token') {
      return HttpResponse.text('', { status: 401 });
    }
    const data = await request.formData();
    mockUpdate(
      data.get('commit_hash') as string,
      data.get('complexity_score'),
      data.get('date'),
    );
    return HttpResponse.json(
      {
        hash: data.get('commit_hash'),
        date: data.get('date'),
        score: data.get('complexity_score'),
      },
      {
        status: 200,
      },
    );
  }),
);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => {
  server.resetHandlers();
  vi.resetAllMocks();
});

const fileConfig = {
  storage: 'estimator.txt',
} satisfies Configuration;

const httpConfig = {
  storage: {
    api,
    token: 'token',
    id: 'id',
  },
} satisfies Configuration;

describe.each([
  ['File', fileConfig],
  ['Http', httpConfig],
])('%s', (group, config) => {
  it('does not break if entries are empty', async ({ effectValue, repo }) => {
    await repo.write('.estimatorrc.json', JSON.stringify(config));
    mockStatus.mockReturnValue({ complexity_score: 0, timelogs_sum: 0 });
    const program = Effect.gen(function* () {
      const storage = yield* Storage;
      return yield* storage.status;
    });

    const result = await effectValue(program);
    expect(result).toMatchObject({ score: 0, secondsSpent: 0 });
  });

  it('returns the latest score', async ({ effectValue, repo }) => {
    await repo.write('.estimatorrc.json', JSON.stringify(config));
    mockStatus.mockReturnValue({ complexity_score: 2, timelogs_sum: 120 });
    const program = Effect.gen(function* () {
      const storage = yield* Storage;
      yield* storage.update('hash1', new Date('2021-01-04T00:00:00Z'), 1);
      yield* storage.update('hash2', new Date('2021-01-04T00:01:00Z'), 2);
      return yield* storage.status;
    });
    const result = await effectValue(program);
    expect(result).toMatchObject({ score: 2, secondsSpent: 120 });
    if (group === 'Http') {
      expect(mockUpdate).toHaveBeenCalledTimes(2);
      expect(mockUpdate).toHaveBeenCalledWith('hash1', '1', '2021-01-04');
      expect(mockUpdate).toHaveBeenCalledWith('hash2', '2', '2021-01-04');
    }
  });
});
