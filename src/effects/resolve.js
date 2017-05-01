function resolve(value) {
  return { effect: 'resolve', value }
}

function resolveHandler(effect) {
  return { effect: '_resolve', value: effect.value }
}

module.exports.factory = resolve
module.exports.handler = resolveHandler
