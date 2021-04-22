import fs from 'fs';
import path from 'path';

import { processFileBlocks } from './utils';

const recipe = process.argv[2];

const filesPath = path.resolve(__dirname, 'files');
fs.mkdirSync(filesPath, {
  recursive: true,
});

const processed = processFileBlocks(
  fs.readFileSync(recipe).toString(),
  (file, content) => {
    const targetPath = `${path.parse(recipe).name}-${file}`;
    fs.writeFileSync(`${filesPath}/${targetPath}`, content);
    return targetPath;
  },
);

fs.writeFileSync(recipe, processed);
