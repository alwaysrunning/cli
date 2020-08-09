#!/usr/bin/env node
const program = require("commander")
program.version(require('../package.json').version)
    .usage('<command> [项目名称]')
    .command('init', '创建新项目') // 子命令，执行hpa-init.js文件
    .alias('i') // 别名
    .option('-i, --init', 'init something')  //设置自定义参数和描述
    // .description('test')
    // .action(function(v, o){
    //     console.log(o, 777)
    // })
    .parse(process.argv)


