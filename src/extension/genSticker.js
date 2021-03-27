const { decryptMedia } = require("@open-wa/wa-automate");
const crypto = require("crypto");
const { stickerTransparent } = require("./stickerTransparent");
const { stickerAnimate, makeGif } = require("./makeGif");
const { publishToQueue, getClient } = require('../services/rabbitMQService');

async function genSticker(client, message, user) {
  //fazer try catch do decriptMedia
  getClient(client);
  const id = crypto.randomBytes(16).toString("hex");
  const file = `./temp/${id}.png`;

  if (message && message.body && (message.body.includes("text") || message.body.includes("Text"))) {
    if (message.type == 'chat') {
      const payload = {
        message
      }
  
     return await publishToQueue('text_image', payload)
    }
    // return await generateTextAndCallSticker(message, file, client, user);
  }

  if (message.type === "chat") {
    return await messageNotSticker(client, message);
  }

  const mediaData = await decryptMedia(message);
  const decryptFile = new Buffer.from(mediaData, "base64");

  const TRANSLUCENT_STICKER =
    message.body && message.body.toUpperCase().includes("TRANSPARENTE");

  const TRANSLUCENT_STICKER_WITHOUT_URL =
    message.caption && message.caption.toUpperCase().includes("TRANSPARENTE");

  if (TRANSLUCENT_STICKER) {
    return await stickerTransparent(message, client);
  } else if (TRANSLUCENT_STICKER_WITHOUT_URL) {
    const payload = {
      decryptFile,
      message,
    }

    return await publishToQueue('translucent_image', payload)
    

  } else if (message.type === "image") {
    if (validateCircular(message)) {
      const payload = {
        decryptFile,
        message,
      }
  
      return await publishToQueue('circular_image', payload)
      // await stickerCircular(decryptFile, file, client, message, user);
    } else {
      const payload = {
        decryptFile,
        message,
      }
  
      return await publishToQueue("square_image", payload);
      // await stickerQuadrado(decryptFile, file, client, message, user);
    }
  } else if (message.type === "video") {
    return await stickerAnimate(message, id, client, makeGif, user);
  }
}

async function messageNotSticker(client, message) {
  await client.sendText(
    message.from,
    "*CATALOGO DE FUNÇÕES 💡 :* \n" +

    "📍Figurinha: Envie qualquer arquivo de imagem e receba uma figurinha. \n" +
    "OBS: O bot também funciona em grupos, basta enviar a imagem e marcar @Bot. \n" +
    "📍Text: Escreva 'Text' + uma frase, e receba uma figurinha escrita. \n" +
    "OBS: Usando \n ao final das palavras, o texto é quebrado em duas linhas.\n" +
    "📍Circular: Escreva 'circular' na imagem em questão, e receba sua figurinha no formato redondo. \n" +
    "OBS: Esse comando funciona melhor se as imagens estiverem quadradas.\n" +
    "📍Transparente: Escreva 'transparente' na imagem em questão, e receba figurinhas com fundo transparente. \n" +
    "OBS: Esse comando só funciona se a imagem original já estiver com fundo apagado. \n"
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
