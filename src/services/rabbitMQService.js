const amqp = require("amqplib/callback_api");
var stringify = require("json-stringify-safe");
var client = null;
const CONNECTION =
  "amqps://famkfurb:QM2wh1r-STWKRNCq9nV_dda_OFjDiyUI@fox.rmq.cloudamqp.com/famkfurb";

let ch = null;

exports.getClient = (cl) => {
  client = cl;
};

amqp.connect(CONNECTION, function (err, conn) {
  conn.createConfirmChannel(function (err, channel) {
    ch = channel;
    ch.consume(
      "response_queue",
      async function (msg) {
        const response = JSON.parse(msg.content.toString());
        await sendImageWhatsApp(response);
      },
      {
        noAck: false,
      }
    );
  });
});

exports.publishToQueue = async (queueName, data) => {
  const dataParsed = stringify(data);
  await ch.sendToQueue(queueName, new Buffer.from(dataParsed), {}, (err, ok) => {
    if (err){
      console.log(Date.now(), 'sent')
    }
    console.log("Publicado na fila: ", queueName);
})
};

process.on("exit", (code) => {
  ch.close();
  console.log(`Closing rabbitmq channel`);
});

async function sendImageWhatsApp({ message_from, image64 }) {
  if (!client) {
    return;
  }

  await client
    .sendImageAsSticker(message_from, image64, {
      author: "@autofigurinhas",
      pack: "Stickers Automáticos?\nWPP: 71 98400-3585",
    })
    .then((result) => {
      console.log(`Mensagem enviada para: ${message_from}`);
    })
    .catch(async (erro) => {
      console.error("Error when sending: ");
    });
}
