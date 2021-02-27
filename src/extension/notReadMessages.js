// adotar estrategias pra este caso, sistema sera 24/7?, caso sim se cair foda-se, manda uma mensagem default pra galera dizendo pra reenviar pois esteve fora do ar ...
const User = require("../entities/users");
const { genSticker } = require("./genSticker");
const NUMBER_ID = "14058170633@c.us";

async function notReadMessages(client) {
  const messages = await client.getAllUnreadMessages();
  messages.forEach(async (message) => {
    if (isMentionedInGroup(message)) {
      saveAndGenSticker(message, client);
    } else if (!message.isGroupMsg) {
      saveAndGenSticker(message, client);
    } else {
      await client.sendSeen(message.from);
    }
    await client.sendSeen(message.from);
  });
}

async function saveAndGenSticker(message, client) {
  console.log(message.from);
  const foundedUserGroup = await User.findOne({ phoneId: message.from });
  if (!foundedUserGroup && message.sender.pushname) {
    await User.create({
      name: message.sender.pushname,
      phoneId: message.from,
    });
    console.log(
      `O Usuario: ${message.sender.pushname} foi salvo na base de dados`
    );
  }
  await genSticker(client, message);
  await client.sendSeen(message.from);
}

function isMentionedInGroup(message) {
  return !!(
    message.isGroupMsg &&
    message.mentionedJidList.length > 0 &&
    message.mentionedJidList[0] == NUMBER_ID
  );
}

exports.notReadMessages = notReadMessages;
