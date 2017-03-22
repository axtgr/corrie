function _throw(value) {
  return { effect: 'throw', value };
}

function throwHandler(effect) {
  throw effect.err;
}

module.exports.factory = _throw;
module.exports.handler = throwHandler;
