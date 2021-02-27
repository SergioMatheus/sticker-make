const { create } = require("@open-wa/wa-automate");
const fs = require("fs");
const { cleanTemp } = require("./src/extension/cleanTemp");
const { genSticker } = require("./src/extension/genSticker");
const { notReadMessages } = require("./src/extension/notReadMessages");
const User = require("./src/entities/users");
// var cron = require("node-cron");
var pm2 = require('pm2');
const TEST_NUMBERS = ["5571988044044@c.us", "557199145852@c.us"];
const NUMBER_ID = "557184003585@c.us";
const IS_DEVELOPP = process.env.NODE_ENV !== "DEV";

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
  return IS_DEVELOPP ? productionModeRun(client) : developmentModeRun(client);
});

// cron.schedule("*/59 * * * *", async function () {
//   await cleanTemp();
// });

async function productionModeRun(client) {

  // pm2.connect(function(err) {
  //   if (err) throw err;

  // setTimeout(function worker() {
  //   console.log("Restarting app StickerMake");
  //   pm2.restart('app', function() {});
  //   setTimeout(worker, 1800000);
  //   }, 1800000);
  // });

  await cleanTemp();

  await notReadMessages(client);

  client.onMessage(async (message) => {
    if (isMentionedInGroup(message)) {
      await saveAndGenSticker(message, client);
    } else if (!message.isGroupMsg) {
      await saveAndGenSticker(message, client);
    } else {
      await client.sendSeen(message.from);
    }
  });
}

async function saveAndGenSticker(message, client) {
  const foundedUserGroup = await User.findOne({ phoneId: message.from });
  if (!foundedUserGroup) {
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
      const foundedUser = await User.findOne({ phoneId: message.from });

      if (!foundedUser) {
        await User.create({
          name: message.sender.pushname,
          phoneId: message.from,
        });
      }

      await genSticker(client, message);
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
