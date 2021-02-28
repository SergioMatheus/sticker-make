async function sendMessagesDefault(client, message) {
  switch (message.chatId) {
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
      await client.sendText(
        message.chatId,
        "*O StickerMake é de uso gratuito e não temos responsabilidade pelos Stickers criados*"
      );
      await client.sendText(
        message.chatId,
        "*Siga-nos no Instagram @autofigurinhas*"
      );
      await client.sendText(
        message.chatId,
        "*https://bit.ly/3r24BDe <- Ajude-nos a batizar o bot caso esteja gostando do nosso serviço!*"
      );
      break;
  }
}
exports.sendMessagesDefault = sendMessagesDefault;
