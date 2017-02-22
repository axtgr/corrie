function _return(value) {
  return { effect: 'return', value };
}

function returnHandler(effect) {
  return effect.value;
}

module.exports.factory = _return;
module.exports.handler = returnHandler;
