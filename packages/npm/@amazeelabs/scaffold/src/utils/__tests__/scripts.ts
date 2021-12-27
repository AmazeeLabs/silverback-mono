import mock from 'mock-fs';

import { fixMockFs } from '../fix-mock-fs';
import { readPackageInfo } from '../helpers';
import { installScripts } from '../scripts';

afterEach(mock.restore);

fixMockFs();

describe('installScripts', () => {
  it('inserts missing scripts', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({
          scripts: {},
        }),
      },
    });
    installScripts('./foo');
    expect(readPackageInfo('./foo').scripts?.['test:integration']).toEqual(
      'exit 0',
    );
  });

  it('overrides existing scripts', () => {
    mock({
      './foo': {
        'package.json': JSON.stringify({
          scripts: {
            'test:integration': 'cypress',
          },
        }),
      },
    });
    installScripts('./foo');
    expect(readPackageInfo('./foo').scripts?.['test:integration']).toEqual(
      'exit 0',
    );
  });
});
