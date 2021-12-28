type FileWriter = (path: string, content: string) => string;

export const processFileBlocks = (
  input: string,
  fileWriter: FileWriter,
): string => {
  const matches = [...input.matchAll(/```([a-z\d]+\n(.*?))```/gs)];
  let result = input;
  matches.forEach((match, index) => {
    const unprocessed = match[2] as string;
    const fileMatches = [...unprocessed.matchAll(/([|>])->\s([^\s]+).*?\n?/gs)];
    if (fileMatches.length === 0) {
      return;
    }
    const content = unprocessed.replace(/.*?[|>]->.*\n*/g, '');
    const sourceFile = `${index}.txt`;
    const targetFile = fileMatches[0][2];
    const srcFile = fileWriter(sourceFile, content);
    const func = fileMatches[0][1] === '|' ? '__writeFile' : '__appendFile';
    result = result.replace(
      match[1],
      `typescript\n$$$$.${func}('${srcFile}', '${targetFile}');\n`,
    );
  });
  return result;
};
