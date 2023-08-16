'use strict'

const log = require('npmlog')

// 设置默认等级，debug会使用。
log.level = process.env.LOG_LEVEL || 'info'

// 日志前缀
log.heading = 'vc-cli'

// 添加日志信息
log.addLevel('success', 2000, { fg: 'green', bold: true })

module.exports = log
