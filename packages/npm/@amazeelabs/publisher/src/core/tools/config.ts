import { OAuth2GrantTypes } from './oAuth2GrantTypes';

export type PublisherConfig = {
  /**
   * Port on which the publisher server will be running.
   */
  publisherPort: number;
  /**
   * Host on which the publisher server will be running.
   *
   * Default: "0.0.0.0"
   */
  publisherHost?: string;
  /**
   * Commands to be executed in bash by the publisher.
   */
  commands: {
    /**
     * Clean the current build and caches.
     *
     * Example: "pnpm gatsby clean"
     */
    clean: string;
    /**
     * Build the project.
     *
     * If the command fails, it will be retried:
     * - There are 3 attempts in total
     * - If the first build fails, the clean command will be executed before the
     *   second attempt
     */
    build: {
      /**
       * Example: "pnpm gatsby build"
       */
      command: string;
      /**
       * If the command will not output anything within the specified time (ms),
       * it will be killed and the build attempt will be counted as a failure.
       */
      outputTimeout?: number;
    };
    /**
     * Deploy the build.
     *
     * Example: "pnpm netlify deploy --dir=public --prodIfUnlocked"
     */
    deploy: string;
    /**
     * Serve the build.
     */
    serve: {
      /**
       * Example: "pnpm gatsby serve"
       */
      command: string;
      /**
       * A pattern that will be searched in the output of the command.
       *
       * Example: "You can now view"
       */
      readyPattern: string;
      /**
       * If the readyPattern is not found in the output of the command within
       * the specified time (ms), there will be a warning.
       */
      readyTimeout?: number;
      /**
       * The port on which serve will be running. Used to proxy the requests.
       */
      port: number;
    };
  };
  /**
   * The URL of the database.
   *
   * Example: "persisted-store/publisher.sqlite"
   */
  databaseUrl: string;
  /**
   * Enables persistent builds. DEPRECATED: It slows down incremental builds.
   */
  persistentBuilds?: {
    /**
     * Paths to be persisted. Relative to the project root.
     *
     * Example: ["public", ".cache"]
     */
    buildPaths: Array<string>;
    /**
     * Where to save the persisted builds.
     *
     * Example: "persisted-store/saved-builds"
     */
    saveTo: string;
  };
  /**
   * Enables basic auth.
   */
  basicAuth?: {
    username: string;
    password: string;
  };
  /**
   * Enables OAuth2.
   */
  oAuth2?: {
    clientId: string;
    clientSecret: string;
    scope: string;
    tokenHost: string;
    tokenPath: string;
    grantType: OAuth2GrantTypes;
    // Use for Authorization Code grant type only.
    authorizePath?: string;
    sessionSecret?: string;
    environmentType?: string; // 'development' | 'production';
  };
  /**
   * Specific CORS settings.
   *
   * If omitted, publisher will allow all origins.
   */
  corsOptions?: {
    credentials: boolean;
    origin: Array<string>;
  };
  /**
   * Proxy settings.
   *
   * Example:
   * [
   *   {
   *     prefix: "/sites/default/files",
   *     target: "https://drupal.site",
   *   },
   *   {
   *     prefix: "/graphql",
   *     target: "https://drupal.site",
   *   },
   * ],
   */
  proxy?: Array<{
    prefix: string;
    target: string;
  }>;
};

let _config: PublisherConfig | null = null;

export const getConfig = (): PublisherConfig => {
  if (!_config) {
    throw new Error('Config is not set');
  }
  return _config;
};

export const setConfig = (config: PublisherConfig): void => {
  _config = config;
};

export const clearConfig = (): void => {
  _config = null;
};
