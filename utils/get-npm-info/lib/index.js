'use strict'

const axios = require('axios')
const urlJoin = require('url-join')

async function getLastVersion(pkgName, registry) {
  const data = await getNpmInfo(pkgName, registry)
  if (data) {
    return data['dist-tags']?.latest
  }
  return null
}

function getNpmInfo(pkgName, registry) {
  if (!pkgName) return null
  const registryUrl = registry || getDefaultRegistry(true)
  const remotePkgUrl = urlJoin(registryUrl, pkgName)
  return axios
    .get(remotePkgUrl)
    .then((response) => {
      if (response.status === 200) {
        return response.data
      } else {
        return null
      }
    })
    .catch((err) => {
      return Promise.reject(err)
    })
}

// 默认为淘宝镜像
function getDefaultRegistry(isOrigin = false) {
  return isOrigin ? 'https://registry.npmjs.org/' : 'https://registry.npmmirror.com/'
}

module.exports = { getLastVersion, getDefaultRegistry }
