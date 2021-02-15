const { create, Client, decryptMedia } = require("@open-wa/wa-automate");
const sharp = require("sharp");
const fs = require("fs");
const request = require("request");
const rimraf = require("rimraf");
const mime = require("mime-types");
const crypto = require("crypto");
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const { compress } = require("compress-images/promise");

async function cleanTemp() {
  rimraf("./temp", function () {
    if (!fs.existsSync("./temp")) {
      fs.mkdirSync("./temp", {
        recursive: true,
      });
      fs.mkdirSync("./temp/ext", {
        recursive: true,
      });
      fs.mkdirSync("./temp/ozt", {
        recursive: true,
      });
      fs.mkdirSync("./temp/opt", {
        recursive: true,
      });
    }
  });
  rimraf("./log", function () {
    if (!fs.existsSync("./log")) {
      fs.mkdirSync("./log", {
        recursive: true,
      });
      fs.mkdirSync("./log/compress-images", {
        recursive: true,
      });
    }
  });
  console.log("Pasta Temp limpa com sucesso!");
}

create({
  sessionId: "session",
  authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  hostNotificationLang: "PT_BR",
  logConsole: false,
  popup: true,
  qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then((client) => start(client));

async function start(client) {
  await cleanTemp();
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
    await client.sendSeen(message.id.remote);
  });
  let idMensagensUnique = toUniqueArray(idMensagens);
  idMensagensUnique.forEach(async (message) => {
    await client.sendText(
      message,
      "*Tava off no momento que você mandou a foto, tente novamente.*"
    );
  });

  client.onMessage(async (message) => {
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

function toUniqueArray(a) {
  var newArr = [];
  for (var i = 0; i < a.length; i++) {
    if (newArr.indexOf(a[i]) === -1) {
      newArr.push(a[i]);
    }
  }
  return newArr;
}

async function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer(bitmap).toString("base64");
}

async function genSticker(client, message) {
  const id = crypto.randomBytes(16).toString("hex");
  const file = `./temp/${id}.png`;

  if (message.body.toUpperCase().includes("TRANSPARENTE")) {
    let url;
    if (message.isGroupMsg) {
      url = message.body.split(/\s+/)[2];
    } else {
      url = message.body.split(/\s+/)[1];
    }
    console.log(url);
    // const url = "https://pngimage.net/wp-content/uploads/2018/06/new-york-knicks-logo-png-6.png"
    request({ url, encoding: null }, function (error, response, body) {
      if (!error) {
        sharp(body)
          .resize({
            width: 512,
            height: 512,
            fit: "contain",
            background: {
              r: 255,
              g: 255,
              b: 255,
              alpha: 0,
            },
          })
          .png()
          .toFile(file)
          .then(async function (data) {
            console.log("Foto Convertida e comprimida com sucesso");

            await sendMessagesDefault(client, message);

            await client
              .sendImageAsSticker(message.from, file)
              .then((result) => {
                console.log("Mensagem enviada para: ", result);
              })
              .catch((erro) => {
                console.error("Error when sending: ", erro);
              });
          });
      } else {
        async () =>
          await client.reply(
            message.chatId,
            "💀 *A imagem ou video ou gif enviada nao foi possivel converter em sticker, tente novamente* 💀",
            message.id.toString()
          );
      }
    });
  } else if (message.type === "image") {
    const mediaData = await decryptMedia(message);
    const decryptFile = new Buffer(mediaData, "base64");

    if (
      message.caption &&
      message.caption.toUpperCase().includes("CIRCULAR") &&
      message.type.includes("image")
    ) {
      const width = 460,
        r = width / 2,
        circleShape = Buffer.from(
          `<svg><circle cx="${r}" cy="${r}" r="${r}" /></svg>`
        );
      await sharp(decryptFile)
        .resize({
          width: 512,
          height: 512,
          fit: "contain",
          background: {
            r: 255,
            g: 255,
            b: 255,
            alpha: 0,
          },
        })
        .composite([
          {
            input: circleShape,
            blend: "dest-in",
          },
        ])
        .png()
        .toFile(file)
        .then(async (info) => {
          console.log("Foto Convertida e comprimida com sucesso");

          await sendMessagesDefault(client, message);

          await client
            .sendImageAsSticker(message.from, file)
            .then((result) => {
              console.log("Mensagem enviada para: ", result);
            })
            .catch((erro) => {
              await cleanTemp();
              console.error("Error when sending: ", erro);
            });
        })
        .catch(async (err) => {
          await client.reply(
            message.chatId,
            "💀 *A imagem ou video ou gif enviada nao foi possivel converter em sticker, tente novamente* 💀",
            message.id.toString()
          );
          await cleanTemp();
          console.log(err);
        });
    } else {
      await sharp(decryptFile)
        .resize({
          width: 512,
          height: 512,
          fit: "contain",
          background: {
            r: 255,
            g: 255,
            b: 255,
            alpha: 0,
          },
        })
        .png()
        .toFile(file)
        .then(async (info) => {
          console.log("Foto Convertida e comprimida com sucesso");

          await sendMessagesDefault(client, message);

          await client
            .sendImageAsSticker(message.from, file)
            .then((result) => {
              console.log("Mensagem enviada para: ", result);
            })
            .catch((erro) => {
              console.error("Error when sending: ", erro);
            });
        })
        .catch(async (err) => {
          await client.reply(
            message.chatId,
            "💀 *A imagem ou video ou gif enviada nao foi possivel converter em sticker, tente novamente* 💀",
            message.id.toString()
          );
          await cleanTemp();
          console.log(err);
        });
    }
  } else if (message.type === "video") {
    const decryptFile = await decryptMedia(message);
    const file = `${id}.${mime.extension(message.mimetype)}`;

    await fs.writeFile(`./temp/${file}`, decryptFile, "binary", async (err) => {
      if (err) {
        await client.sendText(
          message.from,
          "💀 *A imagem ou video ou gif enviada nao foi possivel converter em sticker, tente novamente* 💀"
        );
        await cleanTemp();
        console.log(err);
      }
    });

    await makeGif(file, id, client, message);

    const compressGifLossy = async (onProgress) => {
      await compress({
        source: `./temp/${id}mod.gif`,
        destination: `./temp/ext/`,
        onProgress,
        enginesSetup: {
          gif: {
            engine: "giflossy",
            command: ["--lossy=100"],
          },
        },
      });
    };

    const compressGifSicle = async (onProgress) => {
      await compress({
        source: `./temp/ext/${id}mod.gif`,
        destination: `./temp/ozt/`,
        onProgress,
        enginesSetup: {
          gif: {
            engine: "gifsicle",
            command: ["--optimize"],
          },
        },
      });
    };

    const compressGifAgain = async (onProgress) => {
      const result = await compress({
        source: `./temp/ozt/${id}mod.gif`,
        destination: `./temp/opt/`,
        compress_force: true,
        statistic: true,
        autoupdate: true,
        onProgress,
        enginesSetup: {
          gif: {
            engine: "gif2webp",
            command: ["-f", "80", "-mixed", "-q", "30", "-m", "2"],
          },
        },
      });

      const { statistics, errors } = result;
    };

    await compressGifLossy(async () => {
      await compressGifSicle(async () => {
        await compressGifAgain(async (error, statistic, completed) => {
          if (error) {
            console.log("Error happen while processing file ", error);
            await client.sendText(
              message.from,
              "💀 *A imagem ou video ou gif enviada nao foi possivel converter em sticker, tente novamente* 💀"
            );
            console.log(error);
            await cleanTemp();
            return;
          }

          console.log("Gif processado com sucesso");
          if (
            statistic &&
            statistic.size_output &&
            statistic.size_output <= 940000
          ) {
            await sendMessagesDefault(client, message);

            const fileBase64 = await base64_encode(statistic.path_out_new);
            await client
              .sendRawWebpAsSticker(message.from, fileBase64)
              .then((result) => {
                console.log("Mensagem enviada para: ", result);
              })
              .catch(async (erro) => {
                await cleanTemp();
                await client.sendText(
                  message.from,
                  "💀 *A imagem ou video ou gif enviada nao foi possivel converter em sticker, tente novamente* 💀"
                );
                console.error("Error ao enviar a mensagem: ", erro);
              });
          } else {
            await client.sendText(
              message.from,
              "_*Porra meu consagrado(a), seu sticker mesmo comprimindo ainda ficou muito grande, os stickers enviados sao limitados a 1mb pelo whatsapp, me ajude a te ajudar e diminua ele ai*_"
            );
            await cleanTemp();
          }
        });
      });
    });
  } else {
    await client.sendText(
      message.from,
      "*Envie-me no chat privado ou marque no grupo com uma imagem ou gif de ate 15 segundos, para receber de volta em forma de figurinha*"
    );
    await client.sendText(
      message.from,
      "*Tá com duvida de como usar o StickerMake? Gostaria de ver as atualizações? utilize nosso catalogo https://wa.me/c/14058170633*"
    );
  }

  async function makeGif(file, id, client, message) {
    await new Promise((resolve, reject) => {
      let complexFilter = `scale=512:512:force_original_aspect_ratio=decrease,fps=15 , pad=512:512:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`;

      ffmpeg(`./temp/${file}`)
        .complexFilter(complexFilter)
        .setFfmpegPath(ffmpegStatic)
        .setStartTime("00:00:00")
        .setDuration("15")
        .toFormat("gif")
        .save(`./temp/${id}mod.gif`)
        .on("error", async (err) => {
          await client.sendText(
            message.from,
            "💀 *A imagem ou video ou gif enviada nao foi possivel converter em sticker, tente novamente* 💀"
          );
          console.log(`[ffmpeg] error: ${err.message}`);
          await cleanTemp();
          reject(err);
        })
        .on("end", () => {
          console.log("Redimensionamento feito com sucesso!");
          resolve();
        });
    });
  }
}

async function sendMessagesDefault(client, message) {
  // switch (message.from) {
  //   case message.from.includes("557185189322@g.us"):
  //     break;
  //   case "557188044044-1494204216@g.us":
  //     break;
  //   case "557193142784-1495902162@g.us":
  //     break;
  //   default:
  //     await client.reply(
  //       message.chatId,
  //       "💀 *Vou ver e te aviso* 💀",
  //       message.id.toString()
  //     );
  //     await client.sendText(
  //       message.from,
  //       "*Tá com duvida de como usar o StickerMake? Gostaria de ver as atualizações? utilize nosso catalogo https://wa.me/c/14058170633*"
  //     );
  //     await client.sendLinkPreview(
  //       message.from,
  //       "https://discord.gg/XrXurhVxRw",
  //       "*Junte-se ao Discord do Sticker Maker, para poder enviar suas sugestôes e reportar problemas*"
  //     );
  await client.sendText(
    message.from,
    "*Gostou do StickerMake? faça uma doação via pix: a37716cc-5449-4ac6-b38d-1f9de7b67b41*"
  );
  //     await client.sendText(
  //       message.from,
  //       "*O StickerMake é de uso gratuito e não temos responsabilidade pelos Stickers criados*"
  //     );
  //     break;
  // }
}
