const { decryptMedia } = require("@open-wa/wa-automate");
const crypto = require("crypto");
const { stickerTransparent } = require("./stickerTransparent");
const {
  stickerTransparentWithoutUrl,
} = require("./stickerTransparentWithoutUrl");
const { stickerCircular } = require("./stickerCircular");
const { stickerQuadrado } = require("./stickerQuadrado");
const { stickerAnimate, makeGif } = require("./makeGif");
var text2png = require("text2png");

async function genSticker(client, message, user) {
  //fazer try catch do decriptMedia
  const id = crypto.randomBytes(16).toString("hex");
  const file = `./temp/${id}.png`;

  if (message.body.includes("text")) {
    var textoPng = message.body.replace("text ", "");
    if (message.isGroupMsg) {
      textoPng = textoPng.replace('@557184003585', "");
    }
    var bufferTextImg = text2png(textoPng.replace("//n", "/n"), {
      font: "80px Futura",
      color: "teal",
      textAlign: "center",
      lineSpacing: 10,
      padding: 20,
    });
    await stickerTransparentWithoutUrl(
      bufferTextImg,
      file,
      client,
      message,
      user
    );
    return;
  }
  if (message.type === "chat") {
    await messageNotSticker(client, message);
    return;
  }

  const mediaData = await decryptMedia(message);
  const decryptFile = new Buffer.from(mediaData, "base64");

  const TRANSLUCENT_STICKER =
    message.body && message.body.toUpperCase().includes("TRANSPARENTE");

  const TRANSLUCENT_STICKER_WITHOUT_URL =
    message.caption && message.caption.toUpperCase().includes("TRANSPARENTE");

  if (TRANSLUCENT_STICKER) {
    await stickerTransparent(message, client);
  } else if (TRANSLUCENT_STICKER_WITHOUT_URL) {
    await stickerTransparentWithoutUrl(
      decryptFile,
      file,
      client,
      message,
      user
    );
  } else if (message.type === "image") {
    if (validateCircular(message)) {
      await stickerCircular(decryptFile, file, client, message, user);
    } else {
      await stickerQuadrado(decryptFile, file, client, message, user);
    }
  } else if (message.type === "video") {
    await stickerAnimate(message, id, client, makeGif, user);
  }
}

async function messageNotSticker(client, message) {
  await client.sendText(
    message.chatId,
    "*https://bit.ly/3r24BDe <- Ajude-nos a batizar o bot caso esteja gostando do nosso serviço!*"
  );
  await client.sendText(
    message.chatId,
    "*Junte-se ao Discord do Sticker Maker, https://discord.gg/XrXurhVxRw, para poder enviar suas sugestôes e reportar problemas*"
  );
  await client.sendText(
    message.chatId,
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
