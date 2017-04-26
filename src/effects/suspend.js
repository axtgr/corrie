function suspend(value) {
  return { effect: 'suspend', value }
}

function suspendHandler(effect) {
  return { effect: '_suspend', value: effect.value }
}

module.exports.factory = suspend
module.exports.handler = suspendHandler
