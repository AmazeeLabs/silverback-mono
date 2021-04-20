import fs from 'fs';
import path from 'path';
import updateNotifier from 'update-notifier';

import $ from './helpers';

// Check if a newer version of recipes is available.
const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json')).toString(),
);
const notifier = updateNotifier({ pkg });
notifier.notify({ isGlobal: true });

// Read all files from the recipes folder.
const files = fs
  .readdirSync(path.resolve(__dirname, 'recipes'))
  .filter((file) => /\.js$/.test(file));
const recipes = files.map((file) => path.parse(file).name);

const arg = process.argv[2];

// If the first CLI argument is a valid recipe, execute it.
// Else, prompt the user to choose one.
const recipe = recipes.includes(arg)
  ? arg
  : $.prompts([
      {
        type: 'select',
        name: 'Recipe',
        message: 'Pick a recipe',
        choices: recipes.map((recipe) => ({
          title: recipe,
          value: recipe,
        })),
      },
    ]).Recipe;

if (!recipe) {
  $.log.warn('No recipe selected.');
  process.exit(1);
}

try {
  const initialDir = process.cwd();
  require(path.resolve(__dirname, 'recipes', recipe));

  // Search for the closest git repository, but don't go higher than the initial
  // directory.
  let gitDir = process.cwd();
  while (!fs.existsSync(`${gitDir}/.git`) && gitDir !== initialDir) {
    gitDir = path.resolve(gitDir, '..');
  }

  const recipeLogFile = path.resolve(gitDir, 'RECIPES.md');

  const recipeLog = fs.existsSync(recipeLogFile)
    ? fs.readFileSync(recipeLogFile).toString()
    : '# Recipe log\n';

  fs.writeFileSync(
    recipeLogFile,
    `${recipeLog}## Executed \`${recipe}\` on ${new Date().toLocaleString()}\n\`\`\`\n${JSON.stringify(
      $.promptInputs(),
      null,
      2,
    )}\n\`\`\`\n\n`,
  );
} catch (err) {
  $.log.prettyError(err, true, true, true, 1);
}
