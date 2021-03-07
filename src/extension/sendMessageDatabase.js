const Message = require("../entities/messages");

async function sendMessageDatabase(user, sizeGif, imageType) {
  if (user && user._id) {
    await Message.create({
      user_id: user._id,
      image_size: sizeGif,
      image_type: imageType,
    });
  }
}
exports.sendMessageDatabase = sendMessageDatabase;
