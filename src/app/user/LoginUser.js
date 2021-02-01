const Operation = require('src/app/Operation');
const User = require('src/domain/user/User');

class loginUser extends Operation {
  constructor({ usersRepository }) {
    super();
    this.usersRepository = usersRepository;
  }

  async execute(userData) {
    const { SUCCESS, ERROR, VALIDATION_ERROR } = this.outputs;

    const user = new User(userData);

    try {
      const loginUser = await this.usersRepository.login(user);

      this.emit(SUCCESS, loginUser);
    } catch(error) {
      if(error.message === 'ValidationError') {
        return this.emit(VALIDATION_ERROR, error);
      }

      this.emit(ERROR, error);
    }
  }
}

loginUser.setOutputs(['SUCCESS', 'ERROR', 'VALIDATION_ERROR']);

module.exports = loginUser;
