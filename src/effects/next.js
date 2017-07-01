function next(...args) {
  let effect = 'next'
  let result = { effect }

  if (args.length) {
    result.args = args
  }

  return Object.defineProperty(result, 'or', {
    enumerable: false,
    writable: true,
    configurable: true,
    value: function or(orValue) {
      let _result = { effect, orValue }

      if (args.length) {
        _result.args = args
      }

      return _result
    },
  })
}

module.exports.factory = next
