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
  databaseUrl: 'publisher.db',
  basicAuth: {
    username: 'test',
    password: 'test',
  },
  corsOptions: {
    credentials: true,
    origin: ['http://localhost:8888', 'http://127.0.0.1:8888'],
  },
};
