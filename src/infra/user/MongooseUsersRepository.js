const UserMapper = require('./MongooseUserMapper');
const bcrypt = require('bcrypt');

class MongooseUsersRepository {
  constructor({ UserModel }) {
    this.UserModel = UserModel;
  }

  async getAll(...args) {
    const users = await this.UserModel.find(...args);

    return users.map(UserMapper.toEntity);
  }

  async getById(id) {
    const user = await this._getById(id);
    return UserMapper.toEntity(user);
  }

  async register(user) {
    const { valid, errors } = user.validate();
    if (!valid) {
      const error = new Error('ValidationError');
      error.details = errors;

      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    const newUser = await this.UserModel.create(UserMapper.toDatabase(user));
    return UserMapper.toEntity(newUser);
  }

  async login(user) {
    const retrivedUser = await this.UserModel.findOne({
      email: user.email,
    }).exec();
    const isMatch = await bcrypt.compare(user.password, retrivedUser.password);
    if (isMatch) {
      return UserMapper.toEntity(retrivedUser);
    }
    const error = new Error('ValidationError');
    error.details = 'Invalid email or password';
    throw error;
  }

  async remove(_id) {
    await this.UserModel.findByIdAndRemove(_id);
    return;
  }

  async update(_id, newData) {
    const updatedUser = await this.UserModel.findByIdAndUpdate(_id, newData, {
      new: true,
    });
    const userEntity = UserMapper.toEntity(updatedUser);

    const { valid, errors } = userEntity.validate();

    if (!valid) {
      const error = new Error('ValidationError');
      error.details = errors;

      throw error;
    }
    return userEntity;
  }

  async count() {
    return await this.UserModel.count();
  }

  // Private

  async _getById(_id) {
    try {
      return await this.UserModel.findById(_id);
    } catch (error) {
      if (error.name === 'SequelizeEmptyResultError') {
        const notFoundError = new Error('NotFoundError');
        notFoundError.details = `User with id ${_id} can't be found.`;

        throw notFoundError;
      }

      throw error;
    }
  }
}

module.exports = MongooseUsersRepository;
