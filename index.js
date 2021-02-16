const { create } = require("@open-wa/wa-automate");
const fs = require("fs");
const { cleanTemp } = require("./extension/cleanTemp");
const { genSticker } = require("./extension/genSticker");
const { notReadMessages } = require("./extension/notReadMessages");

create({
  sessionId: "session",
  authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  hostNotificationLang: "PT_BR",
  logConsole: false,
  popup: false,
  qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then((client) => start(client));

async function start(client) {
  await cleanTemp();

  await notReadMessages(client);

  client.onMessage(async (message) => {
    const length = fs.readdirSync("./temp").length;
    if (length && length > 50) {
      await cleanTemp();
    }

    await client.sendSeen(message.from);
    if (
      message.isGroupMsg &&
      message.mentionedJidList[0] == "14058170633@c.us"
    ) {
      await genSticker(client, message);
    } else if (!message.isGroupMsg) {
      await genSticker(client, message);
    }
  });
}
