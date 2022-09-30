module.exports = {
  cleanCommand: './clean.sh',
  startCommand: './start.sh',
  startRetries: 3,
  readyPattern: /http:\/\/localhost:3002/,
  buildCommand: './build.sh',
  buildBufferTime: 500,
  buildRetries: 3,
  applicationPort: 3002,
  // Example config for mariadb:
  // logStorage: {
  //   dialect: 'mariadb',
  //   database: 'publisher',
  //   username: 'root',
  //   password: 'mypass',
  //   host: '127.0.0.1',
  //   port: 3306,
  // },
  logStorage: {
    dialect: 'sqlite',
    storage: 'publisher.db',
  },
  basicAuth: {
    username: 'test',
    password: 'test',
  },
  corsOptions: {
    credentials: true,
    origin: ['http://localhost:8888', 'http://127.0.0.1:8888'],
  },
};
