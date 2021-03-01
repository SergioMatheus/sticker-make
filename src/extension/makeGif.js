const { decryptMedia } = require("@open-wa/wa-automate");
const fs = require("fs");
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const { compress } = require("compress-images/promise");
const { cleanTemp } = require("./cleanTemp");
const { sendMessageDatabase } = require("./sendMessageDatabase");
const { formatBytes } = require("./formatBytes");
const { sendMessagesDefault } = require("./sendMessagesDefault");

async function makeGif(file, id, client, message) {
  await new Promise((resolve, reject) => {
    let complexFilter = `scale=512:512:force_original_aspect_ratio=decrease,fps=15 , pad=512:512:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`;

    ffmpeg(`./temp/${file}`)
      .complexFilter(complexFilter)
      .setFfmpegPath(ffmpegStatic)
      .setStartTime("00:00:00")
      .setDuration("12")
      .noAudio()
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
exports.makeGif = makeGif;

async function stickerAnimate(message, id, client, makeGif, user) {
  const decryptFile = await decryptMedia(message);
  const file = `${id}.mp4`;
  // const file = `${id}.mkv`;

  await fs.writeFile(`./temp/${file}`, decryptFile, "base64", async (err) => {
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
        let sizeGif;
        if (
          statistic &&
          statistic.size_output &&
          statistic.size_output <= 940000
        ) {
          sizeGif = await formatBytes(statistic.size_output);

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
          sizeGif = await formatBytes(statistic.size_output);
          await client.sendText(
            message.from,
            `_*Porra meu consagrado(a), seu sticker mesmo comprimindo ainda ficou muito grande,*_
            \n_*Os stickers enviados sao limitados a 1mb pelo whatsapp, me ajude a te ajudar e diminua ele ai*_`
          );
          await cleanTemp();
        }

        await sendMessageDatabase(user, sizeGif);
      });
    });
  });
}
exports.stickerAnimate = stickerAnimate;

async function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer.from(bitmap).toString("base64");
}
