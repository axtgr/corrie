function print(...args) {
  let result = { effect: 'print' }

  if (args.length) {
    result.args = args
  }

  return result
}

function printHandler(effect) {
  let args = effect.args || []
  return console.log(...args)
}

module.exports.factory = print
module.exports.handler = printHandler
