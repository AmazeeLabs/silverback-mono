import { Logger, TLogLevelName } from 'tslog';

export const log = new Logger({
  displayFilePath: 'hidden',
  displayFunctionName: false,
  minLevel: (process.env.LOG as TLogLevelName) || 'info',
});
