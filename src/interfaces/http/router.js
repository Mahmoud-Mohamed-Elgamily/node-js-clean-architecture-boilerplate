const express = require('express');
const statusMonitor = require('express-status-monitor');
const cors = require('cors');
const compression = require('compression');
const methodOverride = require('method-override');
const controller = require('./utils/createControllerRoutes');

module.exports = ({ config, containerMiddleware, loggerMiddleware, errorHandler, swaggerMiddleware }) => {
  const router = express.Router();

  /* istanbul ignore if */
  if(config.env === 'development') {
    router.use(statusMonitor());
  }

  /* istanbul ignore if */
  if(config.env !== 'test') {
    router.use(loggerMiddleware);
  }

  const apiRouter = express.Router();

  apiRouter
    .use(methodOverride('X-HTTP-Method-Override'))
    .use(cors())
    .use(express.json())
    .use(compression())
    .use(containerMiddleware)
    .use('/docs', swaggerMiddleware);

  /*
   * Add your API routes here
   *
   * You can use the `controllers` helper like this:
   * apiRouter.use('/users', controller(controllerPath))
   *
   * The `controllerPath` is relative to the `interfaces/http` folder
   */

  apiRouter.use('/users', controller('user/UsersController'));

  router.use('/api', apiRouter);

  router.use(errorHandler);

  return router;
};
