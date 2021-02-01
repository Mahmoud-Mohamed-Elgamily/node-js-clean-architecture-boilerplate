const User = require('src/domain/user/User');

const MongooseUserMapper = {
  toEntity({ _id: id, name, email, phone }) {
    return new User({ id, name, email, phone });
  },

  toDatabase(survivor) {
    const { name, email, password, phone } = survivor;

    return { name, email, password, phone };
  },
};

module.exports = MongooseUserMapper;
