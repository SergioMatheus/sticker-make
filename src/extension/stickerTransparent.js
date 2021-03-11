const { cleanTemp } = require("./cleanTemp");
const { sendMessagesDefault } = require("./sendMessagesDefault");

async function stickerTransparent(message, client) {
  let url;
  if (message.isGroupMsg) {
    url = message.body.split(/\s+/)[2];
  } else {
    url = message.body.split(/\s+/)[1];
  }

  await sendMessagesDefault(client, message);

  await client
    .sendStickerfromUrl(message.from, url, {
      author: "@autofigurinhas",
      pack: "Stickers Automáticos?\nWPP: 71 98400-3585",
    })
    .then((result) => {
      console.log("Mensagem enviada para: ", result);
    })
    .catch(async (erro) => {
      console.error("Error when sending: ", erro);
    });
}
exports.stickerTransparent = stickerTransparent;
