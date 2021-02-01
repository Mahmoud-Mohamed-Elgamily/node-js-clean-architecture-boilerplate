const { createContainer, asClass, asFunction, asValue } = require('awilix');
const { scopePerRequest } = require('awilix-express');

const config = require('../config');
const Application = require('./app/Application');
const {
  LoginUser,
  RegisterUser,
  GetAllUsers,
  GetUser,
  UpdateUser,
  DeleteUser,
} = require('./app/user');

const UserSerializer = require('./interfaces/http/user/UserSerializer');

const Server = require('./interfaces/http/Server');
const router = require('./interfaces/http/router');
const loggerMiddleware = require('./interfaces/http/logging/loggerMiddleware');
const errorHandler = require('./interfaces/http/errors/errorHandler');
const devErrorHandler = require('./interfaces/http/errors/devErrorHandler');
const swaggerMiddleware = require('./interfaces/http/swagger/swaggerMiddleware');

const logger = require('./infra/logging/logger');
const { 
  database,
  User: UserModel,
} = require('./infra/database/models');
const MongooseUsersRepository = require('./infra/user/MongooseUsersRepository');

const container = createContainer();

// System
container
  .register({
    app: asClass(Application).singleton(),
    server: asClass(Server).singleton(),
  })
  .register({
    router: asFunction(router).singleton(),
    logger: asFunction(logger).singleton(),
  })
  .register({
    config: asValue(config),
  });

// Middlewares
container
  .register({
    loggerMiddleware: asFunction(loggerMiddleware).singleton(),
  })
  .register({
    containerMiddleware: asValue(scopePerRequest(container)),
    errorHandler: asValue(config.production ? errorHandler : devErrorHandler),
    swaggerMiddleware: asValue([swaggerMiddleware]),
  });

// Repositories
container.register({
  usersRepository: asClass(MongooseUsersRepository).singleton(),
});

// Database
container.register({
  database: asValue(database),
  UserModel: asValue(UserModel),
});

// Operations
container.register({
  getUser: asClass(GetUser),
  updateUser: asClass(UpdateUser),
  deleteUser: asClass(DeleteUser),
  getAllUsers: asClass(GetAllUsers),
  loginUser: asClass(LoginUser),
  registerUser: asClass(RegisterUser),
});

// Serializers
container.register({
  userSerializer: asValue(UserSerializer),
});

module.exports = container;
