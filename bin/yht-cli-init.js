#!/usr/bin/env node

const program = require('commander')
const inquirer = require('inquirer')
const glob = require('glob')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const logSymbols = require('log-symbols')
const download = require('../lib/download')
const generator = require('../lib/generator')

program.usage('<project-name>').parse(process.argv)

// 根据输入，获取项目名称
let projectName = program.args[0]

if (!projectName) { // project-name 必填
    // 相当于执行命令的--help选项，显示help信息，这是commander内置的一个命令选项
    program.help()
    return
}

const list = glob.sync('*') // 遍历当前目录
let rootName = path.basename(process.cwd()) // 获取根目录的名称

let next = undefined
let info = {}

// 判断当前目录下是有跟需要创建的项目重名的，如果有重名的就说明这个项目之前已经创建过了，直接返回
if (list.length) { // 如果当前目录不为空
    let arr = list.filter(name => {
        const fileName = path.resolve(process.cwd(), path.join('.', name))
        const isDir = fs.statSync(fileName).isDirectory()
        return fileName.indexOf(projectName) !== -1 && isDir
    })
    if (arr.length !== 0) {
        console.log(`项目${projectName}已经存在`)
        return
    }
    next = inquirer.prompt([{
        type: 'list',
        name: 'templateType',
        message: '请选择模版类型',
        choices: [
            "PC template",
            "moblie template",
            "SSR template",
            "koa template"
        ]
    }]).then(answer => {
        return Promise.resolve({projectName: projectName, templateType:answer.templateType})
    })
} else if (rootName === projectName) {
    next = inquirer.prompt([{
        type: 'list',
        name: 'templateType',
        message: '请选择模版类型',
        choices: [
            "PC template",
            "moblie template"
        ]
    },
    {
        name: 'buildInCurrent',
        message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
        type: 'confirm',
        default: true
    }]).then(answer => {
        let projectName = answer.buildInCurrent ? '.' : projectName
        return Promise.resolve({projectName: projectName, templateType:answer.templateType})
    })
} else {
    next = inquirer.prompt([{
        type: 'list',
        name: 'templateType',
        message: '请选择模版类型',
        choices: [
            "PC template",
            "moblie template"
        ]
    }]).then(answer => {
        return Promise.resolve({projectName: projectName, templateType:answer.templateType})
    })
}

next && go()

function go() {
    next.then(res => {
        let projectRoot = res.projectName
        let templateType = res.templateType
        if (projectRoot !== '.') {
            fs.mkdirSync(projectRoot)
        }
        return download(projectRoot, templateType).then(target => {
            return {
                name: projectRoot,
                root: projectRoot,
                downloadTemp: target
            }
        })
    }).then(context => {
        return inquirer.prompt([{
            name: 'projectName',
            message: '项目的名称',
            default: context.name
        }, {
            name: 'projectVersion',
            message: '项目的版本号',
            default: '1.0.0'
        }, {
            name: 'projectDescription',
            message: '项目的简介',
            default: `A project named ${context.name}`
        }]).then(answers => {
            answers.supportUiVersion = require('../package.json').version
            return {
                ...context,
                metadata: {
                    ...answers
                }
            }
        })
    }).then(context => {
        return generator(context, context.root)
    }).then(context => {
        console.log(logSymbols.success, chalk.green('创建成功:)'))
        console.log(chalk.green('cd ' + context.root + '\nyarn install\nnpm run dev'))
    }).catch(err => {
        console.error(logSymbols.error, chalk.red(`创建失败：${err.message}`))
    })
}