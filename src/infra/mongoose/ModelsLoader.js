const fs = require('fs');
const path = require('path');

module.exports = {
  load({ baseFolder, mongoose, indexFile = 'index.js' }) {
    const loaded = {};

    fs.readdirSync(baseFolder)
      .filter((file) => {
        return (
          file.indexOf('.') !== 0 &&
          file !== indexFile &&
          file.slice(-3) === '.js'
        );
      })
      .forEach((file) => {
        const model = require(path.join(baseFolder, file))(mongoose);

        const modelName = file.split('.')[0];
        loaded[modelName] = model;
      });

    Object.keys(loaded).forEach((modelName) => {
      if (loaded[modelName].associate) {
        loaded[modelName].associate(loaded);
      }
    });

    loaded.database = mongoose;

    return loaded;
  },
};
