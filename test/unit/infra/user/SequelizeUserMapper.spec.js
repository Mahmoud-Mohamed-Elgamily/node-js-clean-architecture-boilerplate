const { expect } = require('chai');
const User = require('src/domain/user/User');
const MongooseUserMapper = require('src/infra/user/MongooseUserMapper');

describe('Infra :: User :: MongooseUserMapper', () => {
  describe('.toEntity', () => {
    it('returns user instance with passed attributes', () => {
      const mockedSequelizeUser = {
        dataValues: {
          id: 1,
          name: 'The Name'
        }
      };

      const entity = MongooseUserMapper.toEntity(mockedSequelizeUser);

      expect(entity).to.be.instanceOf(User);
      expect(entity.id).to.equal(1);
      expect(entity.name).to.equal('The Name');
    });
  });

  describe('.toDatabase', () => {
    it('returns user object prepared to be persisted', () => {
      const user = new User({
        name: 'Some User'
      });

      const dbUser = MongooseUserMapper.toDatabase(user);

      expect(dbUser.name).to.equal('Some User');
      expect(dbUser).to.have.all.keys('name');
    });
  });
});
