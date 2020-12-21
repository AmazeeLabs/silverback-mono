const path = require('path');
const cucumber = require('cypress-cucumber-preprocessor').default;
const browserify = require('@cypress/browserify-preprocessor');

module.exports = (on, config) => {
  const options = {
    ...browserify.defaultOptions,
    browserifyOptions: {
      ...browserify.defaultOptions.browserifyOptions,
      paths: [
        // In case if some of the integration tests are symlinked, let
        // browserify know the node_modules location.
        path.join(__dirname, '../../node_modules'),
      ],
    }
  };
  on('file:preprocessor', cucumber(options));
};
