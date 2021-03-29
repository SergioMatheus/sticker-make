const sharp = require("sharp");
const fs = require("fs");
const { sendMessagesDefault } = require("./sendMessagesDefault");
const { formatBytes } = require("./formatBytes");
const { sendMessageDatabase } = require("./sendMessageDatabase");
const { constants } = require("../entities/constants");
var text2png = require("text2png");
let filePath = "";
const { default: PQueue } = require("p-queue");

const queue = new PQueue({ concurrency: 1 });

const signatureMethod = {
  author: constants.IG,
  pack:  constants.SIGN,
}

async function stickerText(file, client, message, user) {
  try {
    await queue.add(async () => {
      let textoPng;
      if (message.body.includes("text")) {
        textoPng = message.body.replace("text ", "");
      } else {
        textoPng = message.body.replace("Text ", "");
      }
      if (message.isGroupMsg) {
        textoPng = textoPng.replace(`@${constants.NUMBER_RAW}`, "");
      }
      let bufferTextImg = await text2png(textoPng.replace("//n", "/n"), {
        font: "80px sans-serif",
        color: "black",
        bgColor: "alterado na lib",
        textAlign: "center",
        lineSpacing: 20,
        padding: 35,
      });
      filePath = file;
      await sharp(bufferTextImg)
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

          await sendMessageDatabase(user, sizeGif, "Texto");

          await sendMessagesDefault(client, message);

          const fileBase64PNG = await base64_encode(filePath);

          let envioMensagem = false;

          await client
            .sendImageAsSticker(message.chat.id, fileBase64PNG, signatureMethod)
            .then((result) => {
              if (result == false) {
                envioMensagem = true;
              }
              console.log("Mensagem Texto enviada para: ", result);
            });
          if (envioMensagem) {
            await client
              .sendImageAsSticker(message.from, fileBase64PNG, signatureMethod)
              .then((result) => {
                console.log("Mensagem Texto enviada para: ", result);
              });
          }
        })
        .catch(async (err) => {
          await client.reply(
            message.from,
            "💀 *A imagem ou video ou gif enviada nao foi possivel converter em sticker, tente novamente* 💀",
            message.id.toString()
          );
          console.log(err);
        });
    })();
  } catch (error) {}
}

exports.stickerText = stickerText;

async function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer.from(bitmap).toString("base64");
}
