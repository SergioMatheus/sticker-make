const { decryptMedia } = require("@open-wa/wa-automate");
const fs = require("fs");
const crypto = require("crypto");
const { stickerTransparent } = require("./stickerTransparent");
const { stickerCircular } = require("./stickerCircular");
const { stickerQuadrado } = require("./stickerQuadrado");
const { stickerAnimate, makeGif } = require("./makeGif");

async function genSticker(client, message) {
  const id = crypto.randomBytes(16).toString("hex");
  const file = `./temp/${id}.webp`;

  if (message.body.toUpperCase().includes("TRANSPARENTE")) {
    stickerTransparent(message, file, client);
  } else if (message.type === "image") {
    const mediaData = await decryptMedia(message);
    const decryptFile = new Buffer(mediaData, "base64");

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
}

async function messageNotSticker(client, message) {
  await client.sendText(
    message.from,
    "*Tá com duvida de como usar o StickerMake? Gostaria de ver as atualizações? utilize nosso catalogo https://wa.me/c/14058170633*"
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
