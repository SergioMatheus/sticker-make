const sharp = require("sharp");
const axios = require("axios");
const { cleanTemp } = require("./cleanTemp");
const fs = require("fs");
const { sendMessagesDefault } = require("./sendMessagesDefault");

async function stickerTransparent(message, file, client) {
  let url;
  if (message.isGroupMsg) {
    url = message.body.split(/\s+/)[2];
  } else {
    url = message.body.split(/\s+/)[1];
  }
  // let bodyRequest = await getBase64(url);
  //     sharp(bodyRequest)
  //       .resize({
  //         width: 512,
  //         height: 512,
  //         fit: "contain",
  //         background: {
  //           r: 255,
  //           g: 255,
  //           b: 255,
  //           alpha: 0,
  //         },
  //       })
  //       .webp({ quality: 80 })
  //       .toFile(file)
  //       .then(async function (data) {
  //         console.log("Foto Convertida e comprimida com sucesso");

  //         await sendMessagesDefault(client, message);

  //         const fileBase64 = await base64_encode(file);

          await client
            .sendStickerfromUrl(message.from, url)
            .then((result) => {
              console.log("Mensagem enviada para: ", result);
            })
            .catch(async (erro) => {
              await cleanTemp();
              console.error("Error when sending: ", erro);
            });
        // });

}
exports.stickerTransparent = stickerTransparent;

async function getBase64(url) {
  return await axios
    .get(url, {
      responseType: 'arraybuffer'
    })
    .then(response => Buffer.from(response.data))
}

async function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer.from(bitmap).toString("base64");
}
