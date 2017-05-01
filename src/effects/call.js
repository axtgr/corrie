function call(fn, ...args) {
  let context

  if (Array.isArray(fn)) {
    context = fn[1]
    fn = fn[0]
  }

  if (typeof fn !== 'function') {
    throw new TypeError(
      'The first argument to "call" must be a function or an array containing a function'
    )
  }

  return { effect: 'call', fn, context, args }
}

function callHandler(effect) {
  let { fn, context, args } = effect

  if (typeof fn !== 'function') {
    throw new TypeError('"fn" must be a function')
  }

  let value = args ? fn.apply(context, args) : fn.call(context)
  return { effect: '_resolve', value }
}

module.exports.factory = call
module.exports.handler = callHandler
