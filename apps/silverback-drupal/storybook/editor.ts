// @ts-ignore
const components = require.context('./editor', true, /\/index\.(ts|js)$/);

// @ts-ignore
components.keys().forEach(filename => components(filename));
