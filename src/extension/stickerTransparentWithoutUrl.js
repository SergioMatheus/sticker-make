const sharp = require("sharp");
const { cleanTemp } = require("./cleanTemp");
const fs = require("fs");
const replaceColor = require("replace-color");
const { sendMessagesDefault } = require("./sendMessagesDefault");
const crypto = require("crypto");
const id = crypto.randomBytes(16).toString("hex");
const filePNG = `./temp/${id}.png`;
let filePath = "";

async function stickerTransparentWithoutUrl(
  decryptFile,
  file,
  client,
  message
) {
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

            await client
              .sendImageAsSticker(message.from, fileBase64PNG)
              .then((result) => {
                console.log("Mensagem enviada para: ", result);
              })
              .catch(async (erro) => {
                await cleanTemp();
                console.error("Error when sending: ", erro);
              });
          });
        })
        .catch((err) => {
          console.log(err);
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
exports.stickerTransparentWithoutUrl = stickerTransparentWithoutUrl;

async function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer.from(bitmap).toString("base64");
}
