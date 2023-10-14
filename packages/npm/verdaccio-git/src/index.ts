import LocalDataBase from '@verdaccio/local-storage';
import LocalFS from '@verdaccio/local-storage/lib/local-fs';
import { Config, IUploadTarball } from '@verdaccio/types';
import path from 'path';
import git from 'simple-git';

import { proxyTarball, pushToGit } from './package';

/**
 * GitPackageStorage
 *
 * Storage adapter that attempts to push a packages content to a git repository.
 */
class GitPackageStorage extends LocalFS {
  public writeTarball(name: string): IUploadTarball {
    return proxyTarball(
      super.writeTarball(name),
      () => pushToGit(name, this.path, git(), this.logger),
      this.logger,
    );
  }
}

/**
 * Storage plugin using GitPackageStorage
 */
export default class GitDataBase extends LocalDataBase {
  /**
   * Overloaded constructor.
   *
   * TODO: Find out why this is necessary. Using parent constructor fails due to undefined logger.
   *
   * @param config
   * @param configWithLogger
   */
  public constructor(config: Config, configWithLogger: Config) {
    // The parent constructor type states that the second argument is a Logger,
    // but it is actually another Config instance. Yet the first Config argument
    // has no logger property, but the second one does. 🤯
    super(config, configWithLogger.logger);
  }

  /**
   * Returns an instance of GitPackageStorage
   *
   * @inheritDoc
   */
  public getPackageStorage(packageName: string): LocalFS {
    return new GitPackageStorage(
      path.join(path.resolve(this.config.path), packageName),
      this.logger.child({ sub: 'git' }),
    );
  }
}
