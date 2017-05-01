function _return(value) {
  return { effect: 'return', value }
}

function returnHandler(effect, execution) {
  return execution.complete(effect.value)
}

module.exports.factory = _return
module.exports.handler = returnHandler
