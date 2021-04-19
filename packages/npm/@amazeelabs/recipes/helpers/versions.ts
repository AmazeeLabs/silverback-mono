import semver from 'semver';

export const minimalVersion = (minimalVersion: string) => (
  versionOutput: string,
) => {
  return semver.gte(
    semver.coerce(versionOutput) || '0.0.0',
    semver.coerce(minimalVersion) || '0.0.0',
  )
    ? undefined
    : `version ${minimalVersion} required, but ${semver.coerce(
        versionOutput,
      )} was found`;
};
