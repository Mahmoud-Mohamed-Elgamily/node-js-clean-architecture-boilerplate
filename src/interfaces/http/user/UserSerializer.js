const UserSerializer = {
  serialize({ id, name, email, password, phone, token }) {
    return {
      id,
      name,
      email,
      password,
      phone,
      token
    };
  },
};

module.exports = UserSerializer;
