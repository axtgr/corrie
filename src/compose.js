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
  let result, nextValue, throwNext

  while (!result || !result.done) {
    result = throwNext ? iterator.throw(nextValue) : iterator.next(nextValue)
    throwNext = false
    let { value, done } = result

    if (value && value.effect === 'next') {
      if (routines[1]) {
        try {
          nextValue = yield* runRoutines.call(
            this,
            routines.slice(1),
            value.args
          )
        } catch (err) {
          nextValue = err
          throwNext = true
        }
      } else {
        nextValue = value.orValue
      }
    } else if (done) {
      return yield { effect: 'resolve', value }
    } else {
      try {
        nextValue = yield value
      } catch (err) {
        nextValue = err
        throwNext = true
      }
    }
  }
}
