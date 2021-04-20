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
  require(path.resolve(__dirname, 'recipes', recipe));
} catch (err) {
  $.log.prettyError(err, true, true, true, 1);
}
