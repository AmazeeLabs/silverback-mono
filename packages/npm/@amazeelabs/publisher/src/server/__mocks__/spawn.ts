import { ShellMock } from '../helpers';

export const isSpawnChunk = jest.requireActual('../spawn').isSpawnChunk;

export const spawn = (cmd: string, payload: any) => {
  return ShellMock.create(cmd, payload);
};
