import { isGitPackage } from '../package';

describe('isGitPackage', () => {
  it('returns true if there is a complete "git-publish" config', () => {
    expect(
      isGitPackage({
        config: {
          'git-publish': {
            branch: 'development',
            url: 'https://github.com/amazeelabs/silverback',
          },
        },
      }),
    ).toBe(true);
  });

  it('returns false if there is no "git-publish" config', () => {
    expect(
      isGitPackage({
        config: {},
      }),
    ).toBe(false);
  });

  it('returns false if there is an incomplete "git-publish" config', () => {
    expect(
      isGitPackage({
        config: {
          'git-publish': {
            branch: 'development',
          },
        },
      }),
    ).toBe(false);
  });
});
