const { attributes } = require('structure');

const User = attributes({
  id: String,
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    email: true,
  },
  phone: {
    type: String,
  },
  password: String,
  passwordConfirmation: {
    type: String,
    minLength: 8,
    required: true,
    equal: { attr: 'password' },
  },
})(
  class User {
    isLegal() {
      return this.age >= User.MIN_LEGAL_AGE;
    }
  }
);

User.MIN_LEGAL_AGE = 21;

module.exports = User;
