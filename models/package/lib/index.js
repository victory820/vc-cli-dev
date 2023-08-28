'use strict'

const path = require('path')

const pkgDir = require('pkg-dir').sync
const npminstall = require('npminstall')
const pathExists = require('path-exists').sync
const fse = require('fs-extra')

const { isObject } = require('@v-cli-dev/utils')
const formatPath = require('@v-cli-dev/format-path')
const { getDefaultRegistry, getLastVersion } = require('@v-cli-dev/get-npm-info')

class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package类中options不能为空')
    }
    if (!isObject(options)) {
      throw new Error('Package类中options必须为对象')
    }
    // package的路径
    this.targetPath = options.targetPath
    // package的存储路径
    this.storePath = options.storePath

    this.packageName = options.packageName
    this.packageVersion = options.packageVersion
    // 缓存目录前缀（需要注意npminstall的版本，存储的文件名不同）
    this.cacheFilePathPrefix = this.packageName.replace('/', '+')
  }

  // 将版本号处理为指定格式
  async _prepare() {
    // 缓存路径生成
    if (this.storePath && !pathExists(this.storePath)) {
      // 确保目录存在
      fse.mkdirpSync(this.storePath)
    }
    if (this.packageVersion === 'latest') {
      const tempVersion = await getLastVersion(this.packageName, getDefaultRegistry())
      if (tempVersion) {
        this.packageVersion = tempVersion
      }
    }
  }

  get cacheFilePath() {
    // /Users/用户名/.v-cli-dev/dependencies/node_modules/.store/@v-cli-dev+init@0.0.2
    // 下载包的格式为：@xxx-cli+init@1.1.3
    return path.resolve(
      this.storePath,
      '.store',
      `${this.cacheFilePathPrefix}@${this.packageVersion}`
    )
  }

  getSpecificCacheFilePath(version) {
    return path.resolve(this.storePath, '.store', `${this.cacheFilePathPrefix}@${version}`)
  }

  // 判断当前package是否存在
  async exists() {
    // 是否为缓存路径
    if (this.storePath) {
      await this._prepare()
      return pathExists(this.cacheFilePath)
    } else {
      return pathExists(this.targetPath)
    }
  }

  // 安装package
  async install() {
    await this._prepare()
    return npminstall({
      root: this.targetPath,
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
      storeDir: this.storePath,
      registry: getDefaultRegistry()
    })
  }

  // 更新
  async update() {
    await this._prepare()
    // 获取最新的npm模块版本号
    const latestPkgVersion = await getLastVersion(this.packageName, getDefaultRegistry())
    // 查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestPkgVersion)
    // 如果不存在直接安装最新版本
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        pkgs: [{ name: this.packageName, version: latestPkgVersion }],
        storeDir: this.storePath,
        registry: getDefaultRegistry()
      })
      // 成功后更新版本
      this.packageVersion = latestPkgVersion
    }
  }

  // 获取入口文件路径
  getRootFilePath() {
    function _getRootFile(targetPath) {
      // 1. 获取package.json所在目录
      const dir = pkgDir(targetPath)
      if (dir) {
        // 2. 读取package.json内容
        const packagePath = path.resolve(dir, 'package.json')
        const pkgFile = require(packagePath)
        // 3. 寻找main或lib字段
        if (pkgFile && pkgFile.main) {
          // 4. 兼容不同系统（macos/windows）下的路径
          return formatPath(path.resolve(dir, pkgFile.main))
        }
      }
      return null
    }
    // 存在缓存，入口文件从缓存中获取
    if (this.storePath) {
      // /Users/用户名/.v-cli-dev/dependencies/node_modules/.store/@v-cli-dev+init@0.0.2/node_modules/@v-cli-dev/init/lib
      const tempTargetPath = path.resolve(this.cacheFilePath, 'node_modules', this.packageName)
      return _getRootFile(tempTargetPath)
    } else {
      return _getRootFile(this.targetPath)
    }
  }
}

module.exports = Package
