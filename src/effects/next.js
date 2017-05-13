function next(...args) {
  let effect = 'next'

  return {
    effect,
    args,
    or(orValue) {
      return { effect, args, orValue }
    },
  }
}

module.exports.factory = next
