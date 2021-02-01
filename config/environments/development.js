const path = require('path');
const logPath = path.join(__dirname, '../../logs/development.log');

module.exports = {
  web: {
    port: 3000,
  },
  // logging: {
  //   appenders: [{ type: 'console' }, { type: 'file', filename: logPath }],
  // },
  logging: {
    appenders: {
      logs: { type: 'console', filename: logPath },
    },
    categories: { default: { appenders: ['logs'], level: 'info' } },
  },
  JWTSecret:'T0p$3cr3T'
};
