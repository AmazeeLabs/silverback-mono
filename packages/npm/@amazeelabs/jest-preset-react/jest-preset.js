const basePreset = require('@amazeelabs/jest-preset');

basePreset.projects[0].testEnvironment = 'jsdom';

module.exports = basePreset;
