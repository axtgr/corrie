function print(...args) {
  return { effect: 'print', args }
}

function printHandler(effect) {
  let args = effect.args || []
  return console.log(...args)
}

module.exports.factory = print
module.exports.handler = printHandler
