const venom = require("venom-bot");
const fs = require("fs");
const mime = require("mime-types");
const crypto = require("crypto");
const sharp = require("sharp");
var ffmpegStatic = require("ffmpeg-static");
var ffprobeStatic = require("ffprobe-static");
const request = require("request");
var rimraf = require("rimraf");
const ffmpeg = require("fluent-ffmpeg");
const { compress } = require("compress-images/promise");

run();

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

function toUniqueArray(a) {
  var newArr = [];
  for (var i = 0; i < a.length; i++) {
    if (newArr.indexOf(a[i]) === -1) {
      newArr.push(a[i]);
    }
  }
  return newArr;
}

async function run() {
  await cleanTemp();

  venom
    .create({
      debug: false,
      folderNameToken: "tokens",
      disableWelcome: true,
      autoClose: 4000,
    })
    .then((client) => start(client))
    .catch((erro) => {
      console.log(erro);
    });
}

async function start(client) {
  // const chats = await client.getAllGroups();
  // console.log(chats.length);
  // chats.forEach(async element => {

  //     await client
  //         .sendText(element.id._serialized, '*ALERTA!!!!*' +
  //             '\n\n_*-Bot novamente online agora com esse novo numero*_')

  //     await client
  //         .sendLinkPreview(
  //             element.id._serialized,
  //             'https://discord.gg/XrXurhVxRw',
  //             '*As Proximas atualizações somente serão informadas via chat do discord*'
  //         );
  // });

  const messages = await client.getAllUnreadMessages();
  let idMensagens = [];
  messages.forEach(async (message) => {
    if (message.mentionedJidList.length > 0) {
      idMensagens.push(message.id.remote);
    } else if (
      (!message.from.includes("-") && message.type.includes("image")) ||
      (!message.from.includes("-") && message.type.includes("video"))
    ) {
      idMensagens.push(message.id.remote);
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

    // if (message.from.includes('85189322')) {
    //     await client
    //         .sendImageAsSticker(message.from, 'https://onlinepngtools.com/images/examples-onlinepngtools/new-york-city-transparent.png')
    //     return true;
    // }

    const length = fs.readdirSync("./temp").length;
    if (length > 20) {
      await cleanTemp();
    }
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
                console.log("Mensagem enviada para: ", result.to.formattedName);
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
    const decryptFile = await client.decryptFile(message);

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
              console.log("Mensagem enviada para: ", result.to.formattedName);
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
              console.log("Mensagem enviada para: ", result.to.formattedName);
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
          console.log(err);
        });
    }
  } else if (message.type === "video") {
    const decryptFile = await client.decryptFile(message);
    const file = `${id}.${mime.extension(message.mimetype)}`;

    await fs.writeFile(`./temp/${file}`, decryptFile, "binary", async (err) => {
      if (err) {
        await client.sendText(
          message.from,
          "💀 *A imagem ou video ou gif enviada nao foi possivel converter em sticker, tente novamente* 💀"
        );
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
            return;
          }

          console.log("Gif processado com sucesso");
          if (
            statistic &&
            statistic.size_output &&
            statistic.size_output <= 940000
          ) {
            await sendMessagesDefault(client, message);

            await client
              .sendImageAsStickerGif(message.from, statistic.path_out_new)
              .then((result) => {
                console.log("Mensagem enviada para: ", result.to.formattedName);
              })
              .catch(async (erro) => {
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

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
async function makeGif(file, id, client, message) {
  await new Promise((resolve, reject) => {
    let complexFilter = `scale=512:512:force_original_aspect_ratio=decrease,fps=15 , pad=512:512:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`;

    ffmpeg(`./temp/${file}`)
      .complexFilter(complexFilter)
      .setFfmpegPath(ffmpegStatic)
      .setFfprobePath(ffprobeStatic)
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
        reject(err);
      })
      .on("end", () => {
        console.log("Redimensionamento feito com sucesso!");
        resolve();
      });
  });
}

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
      await client.sendText(
        message.from,
        "*Tá com duvida de como usar o StickerMake? Gostaria de ver as atualizações? utilize nosso catalogo https://wa.me/c/14058170633*"
      );
      await client.sendLinkPreview(
        message.from,
        "https://discord.gg/XrXurhVxRw",
        "*Junte-se ao Discord do Sticker Maker, para poder enviar suas sugestôes e reportar problemas*"
      );
      await client.sendText(
        message.from,
        "*Gostou do StickerMake? faça uma doação via pix: a37716cc-5449-4ac6-b38d-1f9de7b67b41*"
      );

      await client.sendText(
        message.from,
        "*O StickerMake é de uso gratuito e não temos responsabilidade pelos Stickers criados*"
      );
      break;
  }
}
