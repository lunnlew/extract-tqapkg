
const path = require('path')
const fs = require('fs');

var start = async (params) => {
  let filename = params.file
  if (!filename) {
    throw new Error('请提供要提取的文件')
  }

  let buf = await new Promise((resolve, reject) => {
    fs.readFile(filename, function (err, bytesRead) {
      if (err) throw err;
      resolve(bytesRead);
    })
  })
  console.log("\nHeader info:");
  let firstMark = buf.readUInt8(0);
  console.log("  firstMark: 0x%s", firstMark.toString(16));

  let unknownInfo = buf.readUInt32BE(1);
  console.log("  unknownInfo: 0x%s", unknownInfo.toString(16));

  let infoListLength = buf.readUInt32BE(5);
  console.log("  infoListLength: 0x%s", infoListLength.toString(16));

  let dataLength = buf.readUInt32BE(9);
  console.log("  dataLength: 0x%s", dataLength.toString(16));

  let lastMark = buf.readUInt8(13);
  console.log("  lastMark: 0x%s", lastMark.toString(16));

  if (firstMark != 0xbe || lastMark != 0xed) throw Error("Magic number is not correct!");


  console.log("\nFile list info:");
  let offset = 14
  let fileCount = buf.readUInt32BE(offset);
  console.log("  fileCount: ", fileCount.toString(16));
  let files = []
  for (let i = 0; i < fileCount; i++) {
    let info = {}
    offset = offset + 4
    let nameLen = buf.readUInt32BE(offset);
    console.log(`  ${i + 1}:${offset}=>nameLen: 0x%s`, nameLen.toString(16))
    info.name = buf.toString('utf8', offset + 4, offset + 4 + nameLen);

    offset = offset + nameLen + 4
    let contentAddr = buf.readUInt32BE(offset);
    console.log(`  ${i + 1}:${offset}=>contentAddr: 0x%s`, contentAddr.toString(16))
    info.contentAddr = contentAddr

    offset = offset + 4
    let contentLen = buf.readUInt32BE(offset);
    console.log(`  ${i + 1}:${offset}=>contentLen: 0x%s`, contentLen.toString(16))
    info.contentLen = contentLen
    files.push(info)
  }

  console.log("\nFile Saveing:");
  let dir = path.resolve(filename, "..", path.basename(filename, ".tqapkg"));
  for (let file of files) {
    let filename = path.join(dir, (file.name.startsWith("/") ? "." : "") + file.name)
    let pathinfo = path.parse(filename)
    console.log("  save path: %s", filename);
    if (!fs.existsSync(pathinfo.dir)) {
      await new Promise((resolve, reject) => {
        fs.mkdir(pathinfo.dir, { recursive: true }, (err) => {
          if (err) throw err;
          resolve()
        });
      })
    }
    await new Promise((resolve, reject) => {
      fs.writeFile(filename, buf.slice(file.contentAddr, file.contentAddr + file.contentLen), function (err) {
        if (err) throw err;
        resolve();
      })
    })
  }
}
module.exports = {
  start
}