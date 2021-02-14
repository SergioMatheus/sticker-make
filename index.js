const { create, Client, decryptMedia } = require("@open-wa/wa-automate");
const sharp = require("sharp");

create({
  sessionId: "session",
  authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  hostNotificationLang: "PT_BR",
  logConsole: false,
  popup: true,
  qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then((client) => start(client));

async function start(client) {
  const messages = await client.getAllUnreadMessages();
  let idMensagens = [];
  messages.forEach(async (message) => {
    if (
      message.mentionedJidList.length > 0 &&
      message.mentionedJidList.includes("14058170633@c.us")
    ) {
      idMensagens.push(message.from);
    } else if (
      (!message.from.includes("-") && message.type.includes("image")) ||
      (!message.from.includes("-") && message.type.includes("video"))
    ) {
      idMensagens.push(message.from);
    }
    await client.sendSeen(message.id.remote);
  });
  let idMensagensUnique = toUniqueArray(idMensagens);
  idMensagensUnique.forEach(async (message) => {
    await client.sendText(
      message,
      "*Tava off no momento que você mandou a foto, tente novamente.*"
    );
  });

  client.onMessage(async (msg) => {
    // if (msg.body === "!stiker") {
    //     if (quotedMsg && quotedMsg.type == 'image') {
    //         const mediaData = await decryptMedia(quotedMsg);
    //         const imageBase64 = `data:${msg.mimetype};base64,${mediaData.toString(
    //   "base64"
    // )}`;
    //         await client.sendImageAsSticker(msg.from, imageBase64);
    //     }
    // } else if (msg.mimetype) {
    // if (msg.caption === "!stiker" && msg.type === "image") {
    if (msg.isGroupMsg && msg.mentionedJidList[0] == "14058170633@c.us") {
      await imgQuadrada(msg, client);

      // }
      // }
    } else if (!msg.isGroupMsg) {
      if (msg.type == "chat") {
        await client.sendText(
          msg.from,
          "*Mande sua foto para receber como figurinha.*"
        );
      } else {
        await imgQuadrada(msg, client);
      }
    }
  });
}

function toUniqueArray(a) {
  var newArr = [];
  for (var i = 0; i < a.length; i++) {
    if (newArr.indexOf(a[i]) === -1) {
      newArr.push(a[i]);
    }
  }
  return newArr;
}

async function imgQuadrada(msg, client) {
  if (msg.type.includes("image")) {
    const mediaData = await decryptMedia(msg);

    var img = new Buffer(mediaData, "base64");

    sharp(img)
      .resize(512, 512, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer()
      .then(async function (resizedImageBuffer) {
        let resizedImageData = resizedImageBuffer.toString("base64");
        let resizedBase64 = `data:image/png;base64,${resizedImageData}`;
        await client.sendSeen(msg.from);
        await client.sendImageAsSticker(msg.from, resizedBase64);
      });
  } else {
    await client.sendText(
      msg.from,
      "*No Momento nao estamos aceitando stickers animados, por causa da atualizaçao da api do whatsapp.*"
    );
  }
}
