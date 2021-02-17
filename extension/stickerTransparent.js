const sharp = require("sharp");
const request = require("request");
const { cleanTemp } = require("./cleanTemp");
const fs = require("fs");
const { sendMessagesDefault } = require("./sendMessagesDefault");

function stickerTransparent(message, file, client) {
  let url;
  if (message.isGroupMsg) {
    url = message.body.split(/\s+/)[2];
  } else {
    url = message.body.split(/\s+/)[1];
  }
  request({ url, encoding: null }, function (error, response, body) {
    if (!error) {
      sharp(body)
        .resize({
          width: 512,
          height: 512,
          fit: "contain",
          background: {
            r: 255,
            g: 255,
            b: 255,
            alpha: 0,
          },
        })
        .webp({ quality: 80 })
        .toFile(file)
        .then(async function (data) {
          console.log("Foto Convertida e comprimida com sucesso");

          await sendMessagesDefault(client, message);

          const fileBase64 = await base64_encode(file);

          await client
            .sendRawWebpAsSticker(message.from, fileBase64)
            .then((result) => {
              console.log("Mensagem enviada para: ", result);
            })
            .catch(async (erro) => {
              await cleanTemp();
              console.error("Error when sending: ", erro);
            });
        });
    } else {
      async () =>
        await client.reply(
          message.chatId,
          "💀 *A imagem ou video ou gif enviada nao foi possivel converter em sticker, tente novamente* 💀",
          message.id.toString()
        );
    }
  });
}
exports.stickerTransparent = stickerTransparent;

async function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer.from(bitmap).toString("base64");
}
