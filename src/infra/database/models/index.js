const { ModelsLoader } = require('src/infra/mongoose');
const mongoose = require('mongoose');
const { db: config } = require('config');

if (config) {
  mongoose
    .connect(`mongodb://localhost:27017/${config.database}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((err) => {
      console.error('DB Connection Failure => ' + err);
    });
  module.exports = ModelsLoader.load({
    baseFolder: __dirname,
    mongoose,
  });
} else {
  console.error('Database configuration not found, disabling database.');
}
