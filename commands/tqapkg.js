
const path = require('path')

exports.command = 'tqapkg'

exports.describe = '提取QQ小程序源文件'

exports.builder = function (yargs) {
    return yargs
        .option('file', {
            describe: 'apkg文件路径',
            default: '',
            type: 'string'
        })
        .help()
        .showHelpOnFail(true, '使用--help查看有效选项')
        .epilog('copyright 2020 LunnLew');
}

exports.handler = async function (argv) {
    var command = argv._[0]
    await require(path.join(__dirname, 'tasks', command)).start(argv).catch(err => console.log("提取QQ小程序:", err.message))
}  