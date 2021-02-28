const mongoose = require('../config/database');

const MessageSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  image_size: {
    type: Number,
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

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;