'use strict'
// 内置库
const os = require('os')
const path = require('path')

// 外部库
const semver = require('semver')
const colors = require('colors/safe')
const pathExists = require('path-exists')
const { Command } = require('commander')

// 本地库
const log = require('@v-cli-dev/log')
const init = require('@v-cli-dev/init')
const exec = require('@v-cli-dev/exec')

// 本地文件
const pkg = require('../package.json')

const { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } = require('./const')

const userHome = os.homedir()

// 全局命令对象
const program = new Command()

async function core() {
  try {
    prepare()
    registerCommand()
  } catch (error) {
    log.error(error.message)
    if (program.debug) {
      console.log(error)
    }
  }
}

function registerCommand() {
  const cliName = pkg.bin ? Object.keys(pkg.bin)[0] : 'cli-name'
  program
    .name(cliName)
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '启动调试模式', false)
    .option('-tp, --targetPath <targetPath>', '指定调试路径', '')

  // 创建init命令
  program.command('init [projectName]').option('-f, --force', '是否强制初始化项目').action(exec)

  // 指定调试路径
  program.on('option:targetPath', function () {
    const targetPath = this.opts().targetPath
    // 挂载到全局变量中
    process.env.CLI_TARGET_PATH = targetPath
  })

  // 处理debug模式
  program.on('option:debug', function () {
    if (this.opts().debug) {
      process.env.LOG_LEVEL = 'debug'
    } else {
      process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
  })

  // 处理未知命令
  program.on('command:*', function (obj, obj1, obj2) {
    console.log(colors.red('未知的命令：' + obj[0]))
    // 获取所有已注册命令，使用name方法
    const availableCommands = program.commands.map((cmd) => cmd.name())

    if (availableCommands.length > 0) {
      console.log(colors.red('可用命令：', availableCommands.join(',')))
    }
  })

  program.parse() // 不传参，可以兼容electron
}

async function prepare() {
  checkPkgVersion()
  checkNodeVersion()
  checkRoot()
  checkUserHome()
  checkEnv()
  await checkGlobalUpdate()
}

async function checkGlobalUpdate() {
  // 获取当前版本和名称
  const currentVersion = pkg.version
  const pkgName = pkg.name
  // 获取远程最新版本
  const { getLastVersion } = require('@v-cli-dev/get-npm-info')
  const lastVersion = await getLastVersion(pkgName)
  // 比对两个版本
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    // 给出提示
    log.warn(
      colors.yellow(`请手动更新 ${pkgName}，当前版本：${currentVersion}，最新版本：${lastVersion}
            更新命令为：npm install -g ${pkgName}`)
    )
  }
}

function checkEnv() {
  const dotenv = require('dotenv')
  // 查找用户根目录下是否有.env文件（里面存放一些变量）
  const dotPath = path.resolve(userHome, '.env')
  if (pathExists(dotPath)) {
    dotenv.config = {
      // 更改dotenv查找环境变量配置的路径
      path: dotPath
    }
  }
  createDefaultConfig()
}
function createDefaultConfig() {
  // const cliConfig = {
  //   home: userHome
  // }
  // // 判断环境变量中是否存在CLI_HOME属性
  // if (process.env.CLI_HOME) {
  //   cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  // } else {
  //   cliConfig['cliHome'] = path.join(userHome, DEFAULT_CLI_HOME)
  // }
  // process.env.CLI_HOME_PATH = cliConfig['cliHome']

  let cliHomePath = ''
  if (process.env.CLI_HOME) {
    cliHomePath = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliHomePath = path.join(userHome, DEFAULT_CLI_HOME)
  }
  // 最终将CLI_HOME_PATH村上路径值
  // 默认值： /Users/用户名/.vc-cli
  process.env.CLI_HOME_PATH = cliHomePath
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red(`当前登录用户主目录不存在！`))
  }
}

function checkRoot() {
  // 防止sudo创建文件，其他用户无法使用
  const rootCheck = require('root-check')
  rootCheck()
}

function checkNodeVersion() {
  const currentVersion = process.version
  const lowestVersion = LOWEST_NODE_VERSION
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`脚手架需要安装 ${LOWEST_NODE_VERSION} 以上版本的nodejs`))
  }
}

function checkPkgVersion() {
  log.info('cli version:', pkg.version)
}

module.exports = core
