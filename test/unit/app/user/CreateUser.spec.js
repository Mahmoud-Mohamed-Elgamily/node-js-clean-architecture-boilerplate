const { expect } = require('chai');
const RegisterUser = require('src/app/user/RegisterUser');

describe('App :: User :: RegisterUser', () => {
  var registerUser;

  context('when user is valid', () => {
    before(() => {
      const MockUsersRepository = {
        add: (user) => Promise.resolve(user)
      };

      registerUser = new RegisterUser({
        usersRepository: MockUsersRepository
      });
    });

    it('creates the user and emits SUCCESS', (done) => {
      const userData = { name: 'New User' };

      registerUser.on(registerUser.outputs.SUCCESS, (response) => {
        expect(response.name).to.equal('New User');
        done();
      });

      registerUser.execute(userData);
    });
  });

  context('when user is invalid', () => {
    before(() => {
      const MockUsersRepository = {
        add: () => Promise.reject(Error('ValidationError'))
      };

      registerUser = new RegisterUser({
        usersRepository: MockUsersRepository
      });
    });

    it('emits VALIDATION_ERROR with the error', (done) => {
      const userData = { name: 'New User' };

      registerUser.on(registerUser.outputs.VALIDATION_ERROR, (response) => {
        expect(response.message).to.equal('ValidationError');
        done();
      });

      registerUser.execute(userData);
    });
  });

  context('when there is an internal error', () => {
    before(() => {
      const MockUsersRepository = {
        add: () => Promise.reject(new Error('Some Error'))
      };

      registerUser = new RegisterUser({
        usersRepository: MockUsersRepository
      });
    });

    it('emits ERROR with the error', (done) => {
      const userData = { name: 'New User' };

      registerUser.on(registerUser.outputs.ERROR, (response) => {
        expect(response.message).to.equal('Some Error');
        done();
      });

      registerUser.execute(userData);
    });
  });
});
