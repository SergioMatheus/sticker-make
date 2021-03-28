const { create } = require("@open-wa/wa-automate");
const fs = require("fs");
const { cleanTemp } = require("./src/extension/cleanTemp");
const { genSticker } = require("./src/extension/genSticker");
const { notReadMessages } = require("./src/extension/notReadMessages");
const User = require("./src/entities/users");
const { getClient } = require('./src/services/rabbitMQService');
var cron = require("node-cron");
const TEST_NUMBERS = [
  "5571988044044@c.us",
  "557199145852@c.us",
  "557193142784@c.us",
];
const NUMBER_ID = "557184003585@c.us";
const IS_DEVELOPP = process.env.NODE_ENV !== "DEV";

create({
  sessionId: "session",
  authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  executablePath: '/opt/chromium/',
  killProcessOnBrowserClose: true,
  hostNotificationLang: "PT_BR",
  logConsole: false,
  cacheEnabled: false,
  killProcessOnBrowserClose: true,
  popup: false,
  qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then((client) => {
  return IS_DEVELOPP ? productionModeRun(client) : developmentModeRun(client);
});

cron.schedule("*/30 * * * *", async function () {
  await cleanTemp();
});

async function productionModeRun(client) {

  client.setMyStatus("⭐ Stickers de Qualidade ⭐");
  await notReadMessages(client);

  const levelBattery = await client.getBatteryLevel();
  console.log('Estado da bateria atual: ', levelBattery);
  // if (levelBattery <= 50) {
  //   await client.sendText(
  //     "557188044044@c.us",
  //     "*O Celular do bot está descarregando, verifique o que aconteceu na tomada.*"
  //   );
  //   await client.sendText(
  //     "557185189322@c.us",
  //     "*O Celular do bot está descarregando, verifique o que aconteceu na tomada.*"
  //   );
  //   await client.sendText(
  //     "557193142784@c.us",
  //     "*O Celular do bot está descarregando, verifique o que aconteceu na tomada.*"
  //   );
  // }

  console.log("Escutando menssagens");

  client.onMessage(async (message) => {
    if (isMentionedInGroup(message)) {
      await saveAndGenSticker(message, client);
    } else if (!message.isGroupMsg) {
      await saveAndGenSticker(message, client);
    } else {
      await client.sendSeen(message.from);
    }
  });
  // }, 50000);
}

async function saveAndGenSticker(message, client) {
  let user = await User.findOne({ phoneId: message.from });
  if (!user) {
    user = await User.create({
      name: message.sender.pushname,
      phoneId: message.from,
    });
    console.log(
      `O Usuario: ${message.sender.pushname} foi salvo na base de dados`
    );
  }
  await genSticker(client, message, user);
  await client.sendSeen(message.from);
}
exports.saveAndGenSticker = saveAndGenSticker;

async function developmentModeRun(client) {
  console.log("################################");
  console.log("RODANDO EM MODO DESENVOLVIMENTO");
  console.log("################################\n");

  client.onMessage(async (message) => {
    const length = fs.readdirSync("./temp").length;
    if (length && length > 50) {
      await cleanTemp();
    }

    if (!message.isGroupMsg && TEST_NUMBERS.includes(message.from)) {
      let user = await User.findOne({ phoneId: message.from });

      if (!user) {
        user = await User.create({
          name: message.sender.pushname,
          phoneId: message.from,
        });
      }

      await genSticker(client, message, user);
    }
  });
}

function isMentionedInGroup(message) {
  return !!(
    message.isGroupMsg &&
    message.mentionedJidList.length > 0 &&
    message.mentionedJidList[0] == NUMBER_ID
  );
}
exports.isMentionedInGroup = isMentionedInGroup;
