const { decryptMedia } = require("@open-wa/wa-automate");
const crypto = require("crypto");
const { stickerTransparent } = require("./stickerTransparent");
const {
  stickerTransparentWithoutUrl,
} = require("./stickerTransparentWithoutUrl");
const { stickerCircular } = require("./stickerCircular");
const { stickerQuadrado } = require("./stickerQuadrado");
const { stickerAnimate, makeGif } = require("./makeGif");
const Message = require("../entities/messages");
const fs = require("fs");
const TO_CONVERT_TO_MB = 1000000.0;

async function genSticker(client, message, user) {
  //fazer try catch do decriptMedia
  const mediaData = await decryptMedia(message);
  const decryptFile = new Buffer.from(mediaData, "base64");
  const id = crypto.randomBytes(16).toString("hex");
  const file = `./temp/${id}.png`;

  const TRANSLUCENT_STICKER = message.body && message.body.toUpperCase().includes("TRANSPARENTE");

  const TRANSLUCENT_STICKER_WITHOUT_URL = message.caption &&
    message.caption.toUpperCase().includes("TRANSPARENTE");


  if (TRANSLUCENT_STICKER) {
    await stickerTransparent(message, client);
  } else if (
    TRANSLUCENT_STICKER_WITHOUT_URL
  ) {
    await stickerTransparentWithoutUrl(decryptFile, file, client, message);
  } else if (message.type === "image") {
    if (validateCircular(message)) {
      await stickerCircular(decryptFile, file, client, message);
    } else {
      await stickerQuadrado(decryptFile, file, client, message);
    }
  } else if (message.type === "video") {
    await stickerAnimate(message, id, client, makeGif);
  } else {
    await messageNotSticker(client, message);
  }

  const image = fs.statSync(file);
  const imageSize = image.size / TO_CONVERT_TO_MB;
  await Message.create({ user_id: user._id, image_size: imageSize });
}

async function messageNotSticker(client, message) {
  await client.sendText(
    message.chatId,
    "*https://bit.ly/3r24BDe <- Ajude-nos a batizar o bot caso esteja gostando do nosso serviço!*"
  );
  await client.sendText(
    message.from,
    "*Junte-se ao Discord do Sticker Maker, https://discord.gg/XrXurhVxRw, para poder enviar suas sugestôes e reportar problemas*"
  );
  await client.sendText(
    message.from,
    "*Envie-me no chat privado ou marque no grupo com uma imagem ou gif de ate 15 segundos, para receber de volta em forma de figurinha*"
  );
}

function validateCircular(message) {
  return (
    message.caption &&
    message.caption.toUpperCase().includes("CIRCULAR") &&
    message.type.includes("image")
  );
}

exports.genSticker = genSticker;
