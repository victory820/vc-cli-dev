'use strict'
const Command = require('@v-cli-dev/command')

class InitCommand extends Command {}

function init(argv) {
  // function init(projectName, obj) {
  // console.log('init===', process.env.CLI_TARGET_PATH)
  // console.log('projectName=', projectName)
  // console.log('obj=', obj)

  return new InitCommand(argv)
}

module.exports = init
module.exports.InitCommand = InitCommand
