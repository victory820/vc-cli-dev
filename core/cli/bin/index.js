#!/usr/bin/env node
const importLocal = require('import-local')

console.log('this is core bin!!!')

if (importLocal(__dirname)) {
  console.log('使用本地版本')
} else {
  console.log('远程版本')
}
