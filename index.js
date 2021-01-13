const venom = require('venom-bot');
const fs = require('fs');
const glob = require("glob");
const Axios = require('axios');
const ProgressBar = require('progress');
const Zip = require('node-7z');
const mime = require('mime-types');
const crypto = require("crypto");
const Jimp = require("jimp");
const sharp = require("sharp");
var ffmpegStatic = require('ffmpeg-static');
var rimraf = require("rimraf");
const ffmpeg = require("fluent-ffmpeg");
const {
    compress
} = require("compress-images/promise");

run();

async function cleanTemp() {
    rimraf('./temp', function () {
        if (!fs.existsSync('./temp')) {
            fs.mkdirSync('./temp', {
                recursive: true
            });
            fs.mkdirSync('./temp/ext', {
                recursive: true
            });
            fs.mkdirSync('./temp/opt', {
                recursive: true
            });
        }
    });
    console.log("Pasta Temp limpa com sucesso!")
}

async function run() {

    await cleanTemp();

    venom
        .create({ debug: false, folderNameToken: 'tokens', disableWelcome: true, autoClose: 6000 })
        .then((client) => start(client))
        .catch((erro) => {
            console.log(erro);
        });
}

async function start(client) {
    client.onMessage(async (message) => {
        if (message.isGroupMsg && message.mentionedJidList[0] == '14058658204@c.us') {
            await genSticker(client, message);
        } else if (!message.isGroupMsg) {
            await genSticker(client, message);
        }
    });
}

async function genSticker(client, message) {
    const id = crypto.randomBytes(16).toString("hex");
    if (message.type === "image") {
        const decryptFile = await client.decryptFile(message);
        const file = `./temp/${id}.png`;

        await sharp(decryptFile)
            .resize(512, 512, {
                fit: sharp.fit.contain,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toFormat('png')
            .toFile(file)
            .then(info => {
                console.log('Foto Convertida e comprimida com sucesso')
            })
            .catch(err => {
                console.log(err)
            });

        await client.reply(
            message.chatId,
            "⚙️ *Aguarde um momento seu sticker está sendo criado* ⚙️",
            message.id.toString()
        );

        await client
            .sendText(message.from, '*Não nos Responsabilizamos pelos Stickers criados*')
        await client
            .sendImageAsSticker(message.from, file)
            .then((result) => {
                console.log('Mensagem enviada para: ', result.to.formattedName);
            })
            .catch((erro) => {
                console.error('Error when sending: ', erro);
            });

        await client.sendSeen(message.from);
        // await fs.unlinkSync(file);
    } else if (message.type === "video" && message.duration < 15) {
        const decryptFile = await client.decryptFile(message);
        const file = `${id}.${mime.extension(message.mimetype)}`;

        await fs.writeFile(`./temp/${file}`, decryptFile, (err) => {
            if (err) {
                console.log(err)
            }
        });

        await new Promise((resolve, reject) => {
            let complexFilter = `scale=512:512:force_original_aspect_ratio=decrease,fps=15 , pad=512:512:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`;

            ffmpeg(`./temp/${file}`)
                .complexFilter(complexFilter)
                .setFfmpegPath(ffmpegStatic)
                .toFormat('gif')
                .save(`./temp/${id}mod.gif`)
                .on('error', (err) => {
                    console.log(`[ffmpeg] error: ${err.message}`);
                    reject(err);
                })
                .on('end', () => {
                    console.log('Redimensionamento feito com sucesso!');
                    resolve();
                });
        });

        const compressGif = async (onProgress) => {
            const result = await compress({
                source: `./temp/${id}mod.gif`,
                destination: `./temp/opt/`,
                onProgress,
                enginesSetup: {
                    jpg: {
                        engine: "mozjpeg",
                        command: ["-quality", "60"]
                    },
                    png: {
                        engine: "pngquant",
                        command: ["--quality=20-50", "-o"]
                    },
                    svg: {
                        engine: "svgo",
                        command: "--multipass"
                    },
                    gif: {
                        engine: "gifsicle",
                        command: ['--optimize']
                    }

                }
            });

            const {
                statistics,
                errors
            } = result;
        };

        await compressGif(async (error, statistic, completed) => {
            if (error) {
                console.log('Error happen while processing file');
                console.log(error);
                return;
            }

            console.log('Gif processado com sucesso');
            if (statistic.size_output <= 10000000) {

                await client.reply(
                    message.chatId,
                    "⚙️ *Aguarde um momento seu sticker está sendo criado* ⚙️",
                    message.id.toString()
                );

                await client
                    .sendText(message.from, '_*Não nos Responsabilizamos pelos Stickers criados*_')

                await client
                    .sendImageAsStickerGif(message.from, statistic.path_out_new)
                    .then((result) => {
                        console.log('Mensagem enviada para: ', result.to.formattedName);
                    })
                    .catch((erro) => {
                        console.error('Error ao enviar a mensagem: ', erro);
                    });

                await client.sendSeen(message.from);

            } else {
                await client
                    .sendText(message.from, '_*O Gif indicado nao pode ser convertido, por ser muito grande*_')
            }
        });
    } else {
        await client
            .sendText(message.from, '*Envie-me uma imagem ou gif de ate 15 segundos, para receber de volta em forma de figurinha*')
    }
}