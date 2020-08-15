// npm i handlebars metalsmith -D
const Metalsmith = require('metalsmith') // 静态文件生成器
const Handlebars = require('handlebars')
const rm = require('rimraf').sync
const _ = require('lodash')

module.exports = function (context, dest = '.') {
  let metadata = context.metadata
  let src = context.downloadTemp
  if (!src) {
    return Promise.reject(new Error(`无效的source：${src}`))
  }
  
  return new Promise((resolve, reject) => {
    Metalsmith(process.cwd())
      .metadata(metadata) //metadata 为用户输入的内容
      .clean(false)
      .source(src) //模板文件 path
      .destination(dest) //最终编译好的文件存放位置
      .use((files, metalsmith, done) => {
      	const meta = metalsmith.metadata()
        Object.keys(files).forEach(fileName => { //遍历替换模板
          if (_.startsWith(fileName, 'package.json')) { //src目录下的文件不用替换
            const t = files[fileName].contents.toString() // Handlebar compile 前需要转换为字符串
            files[fileName].contents = Buffer.from(Handlebars.compile(t)(meta))
          }
        })
      	done()
      }).build(err => {
      	rm(src)
      	err ? reject(err) : resolve(context)
      })
  })
}
