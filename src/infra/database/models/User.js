'use strict';
const mongoose_delete = require('mongoose-delete');
module.exports = function (mongoose) {
  const { Schema } = mongoose;
  const UserSchema = new Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  UserSchema.plugin(mongoose_delete, {
    deletedAt: true,
    overrideMethods: true,
  });

  const User = mongoose.model('user', UserSchema);
  return User;
};
