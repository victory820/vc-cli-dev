'use strict'
const path = require('path')

function formatPath(p) {
  if (p && typeof p === 'string') {
    const sep = path.sep
    if (sep === '/') {
      return p
    } else {
      // 兼容windows下路径斜杠
      return p.replace(/\\/g, '/')
    }
  }
  return p
}

module.exports = formatPath
