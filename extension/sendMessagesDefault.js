async function sendMessagesDefault(client, message) {
  switch (message.from) {
    case message.from.includes("557185189322@g.us"):
      break;
    case "557188044044-1494204216@g.us":
      break;
    case "557193142784-1495902162@g.us":
      break;
    default:
      await client.reply(
        message.chatId,
        "💀 *Vou ver e te aviso* 💀",
        message.id.toString()
      );
      //     await client.sendText(
      //       message.from,
      //       "*Tá com duvida de como usar o StickerMake? Gostaria de ver as atualizações? utilize nosso catalogo https://wa.me/c/14058170633*"
      //     );
      await client.sendText(
        message.from,
        "*Ajude ao desenvolvimento do StickerMake, faça uma doação via pix: a37716cc-5449-4ac6-b38d-1f9de7b67b41*"
      );
      await client.sendText(
        message.from,
        "*O StickerMake é de uso gratuito e não temos responsabilidade pelos Stickers criados*"
      );
      break;
  }
}
exports.sendMessagesDefault = sendMessagesDefault;
