import { Logger } from 'tslog';

export const log = new Logger({
  displayFilePath: 'hidden',
  displayFunctionName: false,
  minLevel: process.env.DEBUG ? 'silly' : 'info',
});
