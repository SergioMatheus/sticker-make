const venom = require('venom-bot');
const fs = require('fs');
const mime = require('mime-types');
const crypto = require("crypto");
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
            fs.mkdirSync('./temp/ozt', {
                recursive: true
            });
            fs.mkdirSync('./temp/opt', {
                recursive: true
            });
        }
    });
    rimraf('./log', function () {
        if (!fs.existsSync('./log')) {
            fs.mkdirSync('./log', {
                recursive: true
            });
            fs.mkdirSync('./log/compress-images', {
                recursive: true
            });
        }
    });
    console.log("Pasta Temp limpa com sucesso!")
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
        .create({ debug: false, folderNameToken: 'tokens', disableWelcome: true, autoClose: 6000 })
        .then((client) => start(client))
        .catch((erro) => {
            console.log(erro);
        });
}

async function start(client) {
    // const chats = await client.getAllGroups();
    // console.log(chats.length);
    // let caount = 0;
    // chats.forEach(async element => {
    //     caount = await client.getGroupMembers(element.id._serialized);
    //     if (caount.length > 20) {
    //         console.log(element.name)
    //         console.log(caount.length);
    //     }
    // });

    const messages = await client.getAllUnreadMessages();
    let idMensagens = [];
    messages.forEach(async message => {
        if (message.mentionedJidList.length > 0) {
            idMensagens.push(message.id.remote);
            await client.sendSeen(message.id.remote);
        }
    })
    let idMensagensUnique = toUniqueArray(idMensagens);
    idMensagensUnique.forEach(async message => {
        console.log(message);
        await client
            .sendText(message, '*Tava ocupado fazendo Deploy, tente denovo essa porra ai.*')
    });

    client.onMessage(async (message) => {
        await client.sendSeen(message.from);

        const length = fs.readdirSync('./temp').length
        if (length > 20) {
            await cleanTemp();
        }
        if (message.isGroupMsg && message.mentionedJidList[0] == '14058658204@c.us') {
            await genSticker(client, message);
        } else if (!message.isGroupMsg) {
            await client
                .sendLinkPreview(
                    message.from,
                    'https://discord.gg/XrXurhVxRw',
                    '*Junte-se ao Discord do Sticker Maker, para poder enviar suas sugestôes e reportar problemas*'
                );
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
            "💀 *Vou ver e te aviso* 💀",
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

        // await client.sendSeen(message.from);
        // await fs.unlinkSync(file);
    } else if (message.type === "video") {
        const decryptFile = await client.decryptFile(message);
        const file = `${id}.${mime.extension(message.mimetype)}`;

        await fs.writeFile(`./temp/${file}`, decryptFile, 'binary', (err) => {
            if (err) {
                console.log(err)
            }
        });

        await new Promise((resolve, reject) => {
            let complexFilter = `scale=512:512:force_original_aspect_ratio=decrease,fps=15 , pad=512:512:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`;

            ffmpeg(`./temp/${file}`)
                .complexFilter(complexFilter)
                .setFfmpegPath(ffmpegStatic)
                .setStartTime('00:00:00')
                .setDuration('12')
                .toFormat('gif')
                .save(`./temp/${id}mod.gif`)
                .on('error', async (err) => {
                    console.log(`[ffmpeg] error: ${err.message}`);
                    await client
                        .sendText(message.from, '*Error ao criar o sticker tente novamente*')
                    reject(err);
                })
                .on('end', () => {
                    console.log('Redimensionamento feito com sucesso!');
                    resolve();
                });
        });

        const compressGifLossy = async (onProgress) => {

            await compress({
                source: `./temp/${id}mod.gif`,
                destination: `./temp/ext/`,
                onProgress,
                enginesSetup: {
                    gif: {
                        engine: "giflossy",
                        command: ['--lossy=100']
                    },

                }
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
                        command: ["--optimize"]
                    },

                }
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
                        command: ['-f', '80', '-mixed', '-q', '30', '-m', '2']
                    },

                }
            });

            const {
                statistics,
                errors
            } = result;
        };

        await compressGifLossy(async () => {
            await compressGifSicle(async () => {
                await compressGifAgain(async (error, statistic, completed) => {

                    if (error) {
                        console.log('Error happen while processing file');
                        console.log(error);
                        return;
                    }

                    console.log('Gif processado com sucesso');
                    if (statistic && statistic.size_output && statistic.size_output <= 950000) {

                        await client.reply(
                            message.chatId,
                            "💀 *Vou ver e te aviso* 💀",
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

                    } else {
                        await client
                            .sendText(message.from, '_*O Gif indicado nao pode ser convertido, por ser muito grande, para que este seja convertido tente comprimir*_')
                    }
                });
            });
        });
    } else {
        await client
            .sendText(message.from, '*Envie-me no chat privado ou marque no grupo com uma imagem ou gif de ate 15 segundos, para receber de volta em forma de figurinha*')
    }

    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}