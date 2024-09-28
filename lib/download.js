const download = require('download-git-repo')
const path = require('path')
const ora = require('ora')

module.exports = function (target, templateType) {
    target = path.join(target || '.', '.download-temp')
    return new Promise(function(resolve, reject){
        let url = 'github:alwaysrunning/webpack4-vue#master'
        switch (templateType) {
            case "React Hook template":
                url = 'direct:https://github.com/alwaysrunning/React-Hook.git#master'
                break;
            case "Vue moblie template":
                url = 'direct:https://github.com/alwaysrunning/vue-h5.git#master'
                break;
            case "Vue SSR template":
                url = 'direct:https://github.com/alwaysrunning/ssr-vue.git#master'
                // url = 'github:alwaysrunning/nuxtjs#master'
                break;
            case "PC template":
                url = 'direct:https://github.com/alwaysrunning/webpack4-vue.git#master'
                break;
        }
        const spinner = ora(`正在下载项目模板，源地址：${url}`)
        spinner.start()
        // download-git-repo踩坑(路径错误导致下载模板失败--git clone status 128)
        
        download(url,  // https://github.com/alwaysrunning/webpack4-vue.git#master
        target, { clone: true }, (err) => {
            if (err) {
                spinner.fail()
                reject(err)
            } else {
                spinner.succeed()
                // 下载的模板存放在一个临时路径中，下载完成后，可以向下通知这个临时路径，以便后续处理
                resolve(target)
            }
        })
    })
}