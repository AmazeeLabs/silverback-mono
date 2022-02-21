const path = require('path');

module.exports = {
  cleanCommand: './clean.sh',
  startCommand: './start.sh',
  startRetries: 3,
  readyPattern: /http:\/\/localhost:3002/,
  buildCommand: './build.sh',
  buildBufferTime: 500,
  buildRetries: 3,
  applicationPort: 3002,
  databaseUrl: 'file:' + path.resolve(__dirname, 'publisher.db'),
};
