module.exports = function compose(routines) {
  return function* routineComposition(...args) {
    return yield* runRoutines.call(this, routines, args)
  }
}

function* runRoutines(routines, args) {
  if (!routines[0]) {
    return
  }

  let routine = routines[0]

  if (typeof routine !== 'function') {
    throw new TypeError('Every routine must be a function')
  }

  let iterator = routine.apply(this, args)
  let result, nextValue

  while (!result || !result.done) {
    result = iterator.next(nextValue)
    let { value, done } = result

    if (value && value.effect === 'next') {
      nextValue = yield* runRoutines.call(this, routines.slice(1), value.args)
    } else if (done) {
      return yield { effect: 'resolve', value }
    } else {
      nextValue = yield value
    }
  }
}
