'use strict'

const path = require('path')

const Package = require('@v-cli-dev/package')
const log = require('@v-cli-dev/log')

const SETTING = {
  init: '@v-cli-dev/init'
}
// 用户目录下缓存包的路径
const CACHE_DIR = 'dependencies'

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH
  let storeDir = ''
  let pkg

  log.verbose('获取全局路径:::', targetPath)
  log.verbose('获取用户主目录:::', homePath)

  const args = arguments[arguments.length - 1]
  // args.name()方法可以获取当前命令的名称
  const packageName = args.name() ? SETTING[args.name()] : ''
  // 默认获取最新版本
  const packageVersion = 'latest'

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR)
    // 最新的npminstall已经放在.store目录下
    storeDir = path.resolve(targetPath, 'node_modules')
    log.verbose('下载路径:', targetPath)
    log.verbose('存储路径:', storeDir)

    const tempObj = {
      targetPath,
      storePath: storeDir,
      packageName,
      packageVersion
    }
    pkg = new Package(tempObj)
    // 如果存在当前库，就更新
    if (await pkg.exists()) {
      await pkg.update()
    } else {
      await pkg.install()
    }
  } else {
    // 指定了targetPath
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion
    })
  }
  // 找到入口文件，执行
  const rootFile = pkg.getRootFilePath()
  console.log('入口文件:', rootFile)
  if (rootFile) {
    require(rootFile).call(null, Array.from(arguments))
  }
}

module.exports = exec
