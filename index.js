const container = require('src/container');

const app = container.resolve('app');

app
  .start()
  .catch((error) => {
    app.logger.error(error);
    process.exit();
  });
