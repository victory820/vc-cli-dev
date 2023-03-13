#!/usr/bin/env node
const importLocal = require('import-local')

if (importLocal(__filename)) {
  console.log('使用本地版本')
  require('npmlog').info('cli', '正在使用本地版本')
} else {
  require('../lib')(process.argv.splice(2))
}
