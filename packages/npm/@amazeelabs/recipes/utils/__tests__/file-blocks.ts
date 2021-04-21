import fs from 'fs';
import path from 'path';

import { processFileBlocks } from '../file-blocks';

const mockPath = path.resolve(__dirname, 'file-blocks');

const readMock = (file: string) =>
  fs.readFileSync(path.resolve(mockPath, file)).toString();

describe('process file output', () => {
  it('does nothing if no file is embedded', () => {
    const writer = jest.fn();
    writer.mockReturnValue('0.txt');
    const result = processFileBlocks(readMock('no-files/input.md'), writer);
    expect(result).toEqual(readMock('no-files/output.md'));
    expect(writer).not.toBeCalled();
  });

  it('replaces a file with a write operation', () => {
    const writer = jest.fn();
    writer.mockReturnValue('0.txt');
    const result = processFileBlocks(readMock('ts-file/input.md'), writer);
    expect(result).toEqual(readMock('ts-file/output.md'));
    expect(writer).toHaveBeenCalledTimes(1);
    expect(writer).toHaveBeenCalledWith(
      '0.txt',
      readMock('ts-file/foo/bar.ts'),
    );
  });

  it('replaces multiple files', () => {
    const writer = jest.fn();
    writer.mockReturnValue('0.txt');
    const result = processFileBlocks(readMock('multi-file/input.md'), writer);
    expect(result).toEqual(readMock('multi-file/output.md'));
    expect(writer).toHaveBeenCalledTimes(3);
    expect(writer).toHaveBeenCalledWith(
      '1.txt',
      readMock('multi-file/foo/bar.ts'),
    );
    expect(writer).toHaveBeenCalledWith(
      '2.txt',
      readMock('multi-file/README.md'),
    );
    expect(writer).toHaveBeenCalledWith(
      '3.txt',
      readMock('multi-file/test.php'),
    );
  });
});
