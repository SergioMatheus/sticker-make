const { constants } = require("../entities/constants");

async function sendMessagesDefault(client, message) {
  switch (message.from) {
    case constants.systemConst.GROUP_1:
      break;
    case constants.systemConst.GROUP_2:
      break;
    default:
      // break;
      await client.reply(
        message.from,
        "💀 *Vou ver e te aviso* 💀",
        message.id.toString()
      );
      await client.sendLinkWithAutoPreview(
        message.from,
        "https://www.magazinevoce.com.br/magazineautofigurinhas/",
        "*Nós ajude dando uma olhada nos produtos da nossa loja, todos os produtos são de lojas diretas do Magazine Luiza 100% verificadas.*",
      );

      //     await client.sendText(
      //       message.from,
      //       "*O StickerMake é de uso gratuito e não temos responsabilidade pelos Stickers criados*"
      //     );
      //     await client.sendText(
      //       message.from,
      //       "*Siga-nos no Instagram @autofigurinhas*"
      //     );
      //     await client.sendText(
      //       message.from,
      //       "*https://bit.ly/3r24BDe <- Ajude-nos a batizar o bot caso esteja gostando do nosso serviço!*"
      //     );
      break;
  }
}
exports.sendMessagesDefault = sendMessagesDefault;
