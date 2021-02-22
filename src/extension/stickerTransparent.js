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
    .sendStickerfromUrl(message.from, url)
    .then((result) => {
      console.log("Mensagem enviada para: ", result);
    })
    .catch(async (erro) => {
      await cleanTemp();
      console.error("Error when sending: ", erro);
    });
}
exports.stickerTransparent = stickerTransparent;
