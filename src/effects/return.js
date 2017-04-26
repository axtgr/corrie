function _return(value) {
  return { effect: 'return', value }
}

function returnHandler(effect) {
  return this.complete(effect.value)
}

module.exports.factory = _return
module.exports.handler = returnHandler
