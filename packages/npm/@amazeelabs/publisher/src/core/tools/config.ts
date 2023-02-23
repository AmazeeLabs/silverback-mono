export type PublisherConfig = {
  gatewayPort: number;
  commands: {
    clean: string;
    build: string;
    deploy: string;
    serve: {
      command: string;
      readyPattern: string;
      readyTimeout: number;
      port: number;
    };
  };
  databaseUrl: string;
  persistentBuilds?: {
    buildPaths: Array<string>;
    saveTo: string;
  };
  basicAuth?: {
    username: string;
    password: string;
  };
  corsOptions?: {
    credentials: boolean;
    origin: Array<string>;
  };
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
