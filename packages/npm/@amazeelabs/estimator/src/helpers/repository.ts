import path from 'node:path';

import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { SimpleGit, simpleGit } from 'simple-git';

/**
 * Helper class to create a temporary git repository for testing.
 */
export class Repository {
  private constructor(
    public directory: string,
    public git: SimpleGit,
  ) {}

  public static async init() {
    const directory = mkdtempSync(path.join(tmpdir(), 'estimator-test-'));
    const git = simpleGit(directory, {
      config: ['commit.gpgsign=false'],
    });
    await git.init();
    return new Repository(directory, git);
  }

  async init() {
    this.git.init(true);
  }

  async write(file: string, content: string) {
    mkdirSync(path.dirname(path.join(this.directory, file)), {
      recursive: true,
    });
    writeFileSync(path.join(this.directory, file), content);
    await this.git.add(file);
  }

  async read(file: string) {
    return readFileSync(path.join(this.directory, file), 'utf-8');
  }

  async unlink(file: string) {
    rmSync(path.join(this.directory, file), { force: true, recursive: true });
    await this.git.rm(file);
  }

  async commit(message: string) {
    await new Promise((resolve) => setTimeout(resolve, 1001));
    return this.git.commit(message);
  }

  async createBranch(branch: string) {
    return this.git.checkoutLocalBranch(branch);
  }

  async checkout(branch: string) {
    return this.git.checkout(branch);
  }

  destroy() {
    rmSync(this.directory, { recursive: true, force: true });
  }
}
