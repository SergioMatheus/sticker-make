const amqp = require('amqplib/callback_api');
var stringify = require('json-stringify-safe');

const CONNECTION = 'amqps://famkfurb:QM2wh1r-STWKRNCq9nV_dda_OFjDiyUI@fox.rmq.cloudamqp.com/famkfurb'

let ch = null;

amqp.connect(CONNECTION, function (err, conn) {
  conn.createChannel(function (err, channel) {
    ch = channel;
  });
});

module.exports = async function publishToQueue(queueName, data) {
  const dataParsed = stringify(data);
  ch.sendToQueue(queueName, Buffer.from(dataParsed));
}

ch.consume("static_image", function (msg) {
  
});

process.on('exit', (code) => {
  ch.close();
  console.log(`Closing rabbitmq channel`);
});


