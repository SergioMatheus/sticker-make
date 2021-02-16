const sharp = require("sharp");
const { cleanTemp } = require("./cleanTemp");
const fs = require("fs");
const { sendMessagesDefault } = require("./sendMessagesDefault");

async function stickerQuadrado(decryptFile, file, client, message) {
  await sharp(decryptFile)
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
    .then(async (info) => {
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
    })
    .catch(async (err) => {
      await client.reply(
        message.chatId,
        "💀 *A imagem ou video ou gif enviada nao foi possivel converter em sticker, tente novamente* 💀",
        message.id.toString()
      );
      await cleanTemp();
      console.log(err);
    });
}
exports.stickerQuadrado = stickerQuadrado;

async function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer.from(bitmap).toString("base64");
}