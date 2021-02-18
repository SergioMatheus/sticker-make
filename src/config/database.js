
const mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://admin:2GtcAHtE7Mvqmfyp@cluster0.xnc7p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).catch(error => handleError(error));


module.exports = mongoose;