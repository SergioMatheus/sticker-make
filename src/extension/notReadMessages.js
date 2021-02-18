async function notReadMessages(client) {
  const messages = await client.getAllUnreadMessages();
  let idMensagens = [];
  messages.forEach(async (message) => {
    if (
      message.mentionedJidList.length > 0 &&
      message.mentionedJidList.includes("14058170633@c.us")
    ) {
      idMensagens.push(message.from);
    } else if (
      (!message.from.includes("-") && message.type.includes("image")) ||
      (!message.from.includes("-") && message.type.includes("video"))
    ) {
      idMensagens.push(message.from);
    }
    await client.sendSeen(message.from);
  });
  let idMensagensUnique = toUniqueArray(idMensagens);
  console.log(idMensagens);
  idMensagensUnique.forEach(async (message) => {
    await client.sendText(
      message,
      "*Tava off no momento que você mandou a foto, tente novamente.*"
    );
  });
}

function toUniqueArray(a) {
  var newArr = [];
  for (var i = 0; i < a.length; i++) {
    if (newArr.indexOf(a[i]) === -1) {
      newArr.push(a[i]);
    }
  }
  return newArr;
}
exports.notReadMessages = notReadMessages;
