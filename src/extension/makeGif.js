const { decryptMedia } = require("@open-wa/wa-automate");
const { sendMessageDatabase } = require("./sendMessageDatabase");
const { formatBytes } = require("./formatBytes");
const { sendMessagesDefault } = require("./sendMessagesDefault");

async function stickerAnimate(message, id, client, user) {
  const decryptFile = await decryptMedia(message);

  let sizeGif = await formatBytes(decryptFile.toString().length);

  await sendMessageDatabase(user, sizeGif, "Gif");
  await sendMessagesDefault(client, message);

  return await client
    .sendMp4AsSticker(
      message.chat.id,
      decryptFile,
      { crop: true },
      {
        author: "@autofigurinhas",
        pack: "Stickers Automáticos?\nWPP: 71 98400-3585",
      }
    )
    .then((result) => {
      console.log("Mensagem enviada para: ", result);
    })
    .catch(async (erro) => {
      await client.sendText(
        message.from,
        "💀 *A imagem ou video ou gif enviada nao foi possivel converter em sticker, tente novamente* 💀"
      );
      console.error("Error ao enviar a mensagem: ", erro);
    });
}
exports.stickerAnimate = stickerAnimate;
