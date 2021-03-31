const sharp = require("sharp");
const { cleanTemp } = require("./cleanTemp");
const fs = require("fs");
const replaceColor = require("replace-color");
const { sendMessagesDefault } = require("./sendMessagesDefault");
const crypto = require("crypto");
const id = crypto.randomBytes(16).toString("hex");
const { formatBytes } = require("./formatBytes");
const { sendMessageDatabase } = require("./sendMessageDatabase");
const filePNG = `./temp/${id}.png`;
let filePath = "";

async function stickerTransparentWithoutUrl(
  decryptFile,
  file,
  client,
  message,
  user
) {
  sharp.cache(false);
  filePath = file;
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
    .png()
    .toFile(file)
    .then(async (info) => {
      console.log("Foto Convertida e comprimida com sucesso");

      let sizeGif = await formatBytes(info.size);

      await sendMessageDatabase(user, sizeGif, "Transparente");

      await sendMessagesDefault(client, message);

      replaceColor({
        image: filePath,
        colors: {
          type: "hex",
          targetColor: "#FFFFFF",
          replaceColor: "#00000000",
        },
        deltaE: 10,
      })
        .then((jimpObject) => {
          jimpObject.write(filePNG, async (err) => {
            if (err) return console.log(err);

            const fileBase64PNG = await base64_encode(filePNG);

            let envioMensagem = false;

            await client
              .sendImageAsSticker(message.chat.id, fileBase64PNG, {
                author: "@autofigurinhas",
                pack: "Stickers Automáticos?\nWPP: 71 98400-3585",
                discord: 154275562167205888
              })
              .then((result) => {
                if (result == false) {
                  envioMensagem = true;
                }
                console.log("Mensagem Transparente enviada para: ", result);
              });
            if (envioMensagem) {
              await client
                .sendImageAsSticker(message.from, fileBase64PNG, {
                  author: "@autofigurinhas",
                  pack: "Stickers Automáticos?\nWPP: 71 98400-3585",
                })
                .then((result) => {
                  console.log("Mensagem Transparente enviada para: ", result);
                });
            }
          });
        })
        .catch((err) => {
          console.log(err);
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
exports.stickerTransparentWithoutUrl = stickerTransparentWithoutUrl;

async function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer.from(bitmap).toString("base64");
}
