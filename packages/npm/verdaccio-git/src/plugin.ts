import path from 'path';

import { IPackageStorage, Config, IUploadTarball } from '@verdaccio/types';
import LocalDataBase from '@verdaccio/local-storage';
import LocalFS from '@verdaccio/local-storage/lib/local-fs';
import { pushToGit } from './package';

class GitPackageStorage extends LocalFS {
  public writeTarball(name: string): IUploadTarball {
    const tarball = super.writeTarball(name);
    tarball.on = new Proxy(tarball.on, {
      apply: (target, thisArg, args) => {
        const [event, handler] = args;
        if (event === 'success') {
          return target.apply(thisArg, [
            event,
            () => {
              pushToGit(name, this.path, this.logger)
                .then(handler)
                .catch((err) => this.logger.error(`[git] ${err}`));
            },
          ]);
        } else {
          return target.apply(thisArg, [event, handler]);
        }
      },
    });
    return tarball;
  }
}

export default class GitDataBase extends LocalDataBase {
  // TODO: Why is this necessary?
  public constructor(config: Config) {
    super(config, config.logger);
  }

  public getPackageStorage(packageName: string): IPackageStorage {
    const packageStoragePath: string = path.join(
      path.resolve(path.dirname(this.config.self_path || ''), './storage'),
      packageName,
    );
    return new GitPackageStorage(packageStoragePath, this.logger);
  }
}
