const fs = require("fs");
const rimraf = require("rimraf");

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
  rimraf("./logs", function () {
    if (!fs.existsSync("./logs")) {
      fs.mkdirSync("./logs", {
        recursive: true,
      });
      fs.mkdirSync("./logs/session", {
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
exports.cleanTemp = cleanTemp;
