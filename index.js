const { create } = require("@open-wa/wa-automate");
const fs = require("fs");
const { cleanTemp } = require("./src/extension/cleanTemp");
const { genSticker } = require("./src/extension/genSticker");
const { notReadMessages } = require("./src/extension/notReadMessages");
const User = require('./src/entities/users');
const TEST_NUMBERS = ['5571988044044@c.us', '557199145852@c.us'];
const NUMBER_ID = '14058170633@c.us';
const IS_DEVELOPP = process.env.NODE_ENV !== 'DEV';

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
}).then((client) => {
  return !IS_DEVELOPP ? productionModeRun(client) : developmentModeRun(client);
});


async function productionModeRun(client) {
  await cleanTemp();

  await notReadMessages(client);


  client.onMessage(async (message) => {
    const length = fs.readdirSync("./temp").length;
    if (length && length > 50) {
      await cleanTemp();
    }

    await client.sendSeen(message.from);
    if (
      isMentionedInGroup()
    ) {
      await genSticker(client, message);
    } else if (!message.isGroupMsg) {
      await genSticker(client, message);
    }
  });
}

async function developmentModeRun(client) {
  console.log('################################')
  console.log('RODANDO EM MODO DESENVOLVIMENTO')
  console.log('################################\n')

  client.onMessage(async (message) => {
    const length = fs.readdirSync("./temp").length;
    if (length && length > 50) {
      await cleanTemp();
    }
  
    if (!message.isGroupMsg && TEST_NUMBERS.includes(message.from)) {
      const foundedUser = await User.findOne({ phoneId: message.from });

      if (!foundedUser) {
        await User.create({ name: message.sender.pushname, phoneId: message.from })
      }
      
      await genSticker(client, message);
    }
  });
}


function isMentionedInGroup() {
  return !!(message.isGroupMsg &&
    message.mentionedJidList[0] == NUMBER_ID)
}