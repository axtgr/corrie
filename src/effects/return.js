function _return(value) {
  return { effect: 'return', value };
}

function returnHandler(effect) {
  return { effect: '_return', value: effect.value };
}

module.exports.factory = _return;
module.exports.handler = returnHandler;
