const mongoose = require('../config/database');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneId: {
    type: String,
    unique: true,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: null,
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;