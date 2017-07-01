function call(fn, ...args) {
  let context

  if (Array.isArray(fn)) {
    context = fn[0]
    fn = fn[1]
  }

  if (typeof fn !== 'function') {
    throw new TypeError(
      'The first argument to "call" must be a function or an array containing a function'
    )
  }

  let result = { effect: 'call', fn }

  if (context) {
    result.context = context
  }

  if (args.length) {
    result.args = args
  }

  return result
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
