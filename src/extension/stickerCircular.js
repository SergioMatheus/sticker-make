const sharp = require("sharp");
const { cleanTemp } = require("./cleanTemp");
const fs = require("fs");
const { sendMessagesDefault } = require("./sendMessagesDefault");
const { formatBytes } = require("./formatBytes");
const { sendMessageDatabase } = require("./sendMessageDatabase");

async function stickerCircular(decryptFile, file, client, message, user) {
  const width = 460,
    r = width / 2,
    circleShape = Buffer.from(
      `<svg><circle cx="${r}" cy="${r}" r="${r}" /></svg>`
    );
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
    .composite([
      {
        input: circleShape,
        blend: "dest-in",
      },
    ])
    .webp({ quality: 80 })
    .toFile(file)
    .then(async (info) => {
      console.log("Foto Convertida e comprimida com sucesso");

      let sizeGif = await formatBytes(info.size);

      await sendMessageDatabase(user, sizeGif,"Circular");

      await sendMessagesDefault(client, message);

      const fileBase64 = await base64_encode(file);

      await client
        .sendImageAsSticker(message.from, fileBase64)
        .then((result) => {
          console.log("Mensagem enviada para: ", result);
        })
        .catch(async (erro) => {
          console.error("Error when sending: ", erro);
        });
    })
    .catch(async (err) => {
      await client.reply(
        message.from,
        "💀 *A imagem ou video ou gif enviada nao foi possivel converter em sticker, tente novamente* 💀",
        message.id.toString()
      );
      console.log(err);
    });
}
exports.stickerCircular = stickerCircular;

async function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer.from(bitmap).toString("base64");
}
