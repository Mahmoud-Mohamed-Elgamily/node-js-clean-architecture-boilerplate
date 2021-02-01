const { Router } = require('express');
const { inject } = require('awilix-express');
const Status = require('http-status');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');

const UsersController = {
  get router() {
    const router = Router();

    router.use(inject('userSerializer'));

    router.get('/', inject('getAllUsers'), this.index);
    router.post('/', inject('registerUser'), this.register);
    router.post('/login', inject('loginUser', 'config'), this.login);
    router.put('/:id', inject('updateUser'), this.update);
    router.delete('/:id', inject('deleteUser'), this.delete);

    router.get('/single', [authMiddleware, inject('getUser')], this.show);

    return router;
  },

  index(req, res, next) {
    const { getAllUsers, userSerializer } = req;
    const { SUCCESS, ERROR } = getAllUsers.outputs;

    getAllUsers
      .on(SUCCESS, (users) => {
        res.status(Status.OK).json(users.map(userSerializer.serialize));
      })
      .on(ERROR, next);

    getAllUsers.execute();
  },

  show(req, res, next) {
    const { getUser, userSerializer } = req;
    const { SUCCESS, ERROR, NOT_FOUND } = getUser.outputs;

    getUser
      .on(SUCCESS, (user) => {
        res.status(Status.OK).json(userSerializer.serialize(user));
      })
      .on(NOT_FOUND, (error) => {
        res.status(Status.NOT_FOUND).json({
          type: 'NotFoundError',
          details: error.details,
        });
      })
      .on(ERROR, next);

    getUser.execute(req.query.id);
  },

  register(req, res, next) {
    const { registerUser, userSerializer } = req;
    const { SUCCESS, ERROR, VALIDATION_ERROR } = registerUser.outputs;

    registerUser
      .on(SUCCESS, (user) => {
        res.status(Status.CREATED).json(userSerializer.serialize(user));
      })
      .on(VALIDATION_ERROR, (error) => {
        res.status(Status.BAD_REQUEST).json({
          type: 'ValidationError',
          details: error.details,
        });
      })
      .on(ERROR, next);

    registerUser.execute(req.body);
  },

  login(req, res, next) {
    const { loginUser, config, userSerializer } = req;
    const { SUCCESS, ERROR, VALIDATION_ERROR } = loginUser.outputs;

    loginUser
      .on(SUCCESS, (user) => {
        user.token = jwt.sign({ user: user }, config.JWTSecret);

        res.status(Status.CREATED).json(userSerializer.serialize(user));
      })
      .on(VALIDATION_ERROR, (error) => {
        res.status(Status.BAD_REQUEST).json({
          type: 'ValidationError',
          details: error.details,
        });
      })
      .on(ERROR, next);

    loginUser.execute(req.body);
  },

  update(req, res, next) {
    const { updateUser, userSerializer } = req;
    const { SUCCESS, ERROR, VALIDATION_ERROR, NOT_FOUND } = updateUser.outputs;

    updateUser
      .on(SUCCESS, (user) => {
        res.status(Status.ACCEPTED).json(userSerializer.serialize(user));
      })
      .on(VALIDATION_ERROR, (error) => {
        res.status(Status.BAD_REQUEST).json({
          type: 'ValidationError',
          details: error.details,
        });
      })
      .on(NOT_FOUND, (error) => {
        res.status(Status.NOT_FOUND).json({
          type: 'NotFoundError',
          details: error.details,
        });
      })
      .on(ERROR, next);

    updateUser.execute(req.params.id, req.body);
  },

  delete(req, res, next) {
    const { deleteUser } = req;
    const { SUCCESS, ERROR, NOT_FOUND } = deleteUser.outputs;

    deleteUser
      .on(SUCCESS, () => {
        res.status(Status.ACCEPTED).end();
      })
      .on(NOT_FOUND, (error) => {
        res.status(Status.NOT_FOUND).json({
          type: 'NotFoundError',
          details: error.details,
        });
      })
      .on(ERROR, next);

    deleteUser.execute(req.params.id);
  },
};

module.exports = UsersController;
