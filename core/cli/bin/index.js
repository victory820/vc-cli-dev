#!/usr/bin/env node

'use strict'

const importLocal = require('import-local')

if (importLocal(__filename)) {
  const cliName = 'vc-cli-dev'
  require('npmlog').info(`正在使用 ${cliName} 本地版本`)
} else {
  require('../lib')(process.argv.slice(2))
}
