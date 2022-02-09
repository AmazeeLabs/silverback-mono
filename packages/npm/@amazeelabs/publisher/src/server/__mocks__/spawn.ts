import { ShellMock } from '../helpers';

export const isSpawnChunk = jest.requireActual('../spawn').isSpawnChunk;

export const spawn = (cmd: string) => {
  return ShellMock.get(cmd);
};
