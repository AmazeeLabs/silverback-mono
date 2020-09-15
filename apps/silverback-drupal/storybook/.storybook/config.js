// Add the web components polyfill to all stories.
import '@babel/polyfill';
import '@webcomponents/webcomponentsjs/webcomponents-bundle';

import { addDecorator, addParameters, configure } from '@storybook/html';
import { withA11y } from '@storybook/addon-a11y';

import Twig from 'twig';
import addDrupalFilters from 'twig-drupal-filters';

// Import styles
import '../styles.css';

// Add the filters to Drupal.
addDrupalFilters(Twig);

// Automatically import all files ending in *.stories.js
const stories = require.context('../', true, /\.stories\.(ts|js)$/);
function loadStories() {
  stories.keys().forEach(filename => stories(filename));
}

// Helps make UI components more accessible.
addDecorator(withA11y);
addParameters({
  a11y: {
    restoreScroll: true,
  }
});

configure(loadStories, module);
