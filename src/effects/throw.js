function _throw(value) {
  return { effect: 'throw', value }
}

function throwHandler(effect, execution) {
  execution.status = 'completed'
  throw effect.err
}

module.exports.factory = _throw
module.exports.handler = throwHandler
