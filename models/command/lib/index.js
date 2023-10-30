'use strict'

const { LOWEST_NODE_VERSION } = require('./const')
const semver = require('semver')
const colors = require('colors')

class Command {
  constructor(argv) {
    console.log('Command constructor:', argv)
    this._argv = argv
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve()
      chain = chain.then(() => this.checkNodeVersion())
    })
  }

  checkNodeVersion() {
    const currentVersion = process.version
    const lowestVersion = LOWEST_NODE_VERSION
    if (!semver.gte(currentVersion, lowestVersion)) {
      throw new Error(colors.red(`脚手架需要安装 ${LOWEST_NODE_VERSION} 以上版本的nodejs`))
    }
  }

  init() {
    throw new Error('init 必须实现')
  }

  exec() {
    throw new Error('exec 必须实现')
  }
}

module.exports = Command
