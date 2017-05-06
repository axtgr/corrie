module.exports = class CorrieExecution {
  constructor(effectHandlers, resolvers, routine) {
    if (!effectHandlers) {
      throw new Error('Effect handlers are required')
    }

    if (!resolvers) {
      throw new Error('Resolvers are required')
    }

    if (typeof routine !== 'function') {
      throw new TypeError('Routine must be a function')
    }

    this.routine = routine
    this.resolvers = resolvers
    this.effectHandlers = effectHandlers
    this.status = 'pending'
  }

  start(context, args) {
    if (this.status !== 'pending') {
      throw new Error(`Cannot start an execution that is ${this.status}`)
    }

    args = args || []
    this.status = 'started'
    this.iterator = this.routine.apply(context, args)[Symbol.iterator]()

    return this.resolvers.start(() => {
      return this.resume()
    })
  }

  resume(nextValue) {
    return this.resolvers.resume((nextValue) => {
      if (this.status === 'completed') {
        return nextValue
      }

      if (this.status !== 'started') {
        throw new Error(`Cannot resume an execution that is ${this.status}`)
      }

      let value, done

      try {
        let result = this.iterator.next(nextValue)
        value = result.value
        done = result.done

        if (!value || !value.effect) {
          let effect = done ? 'return' : 'yield'
          value = { effect, value }
        }
      } catch (err) {
        value = { effect: 'throw', err }
        done = false
      }

      return handle.call(this, value, (handledValue) => {
        if (this.status === 'completed') {
          return handledValue
        }

        if (done) {
          return this.complete(handledValue)
        } else {
          return this.resume(handledValue)
        }
      })
    }, nextValue)
  }

  throw(err) {
    return this.iterator.throw(err)
  }

  complete(value) {
    if (this.status !== 'started') {
      throw new Error(`Cannot complete an execution that is ${this.status}`)
    }

    return this.resolvers.complete((value) => {
      this.status = 'completed'
      return value
    }, value)
  }
}

function handle(value, cb) {
  return this.resolvers.handle((value) => {
    if (value.effect === 'next') {
      // The "next" effect is handled in compose, hence this workaround.
      // Would it be better if it was a regular effect?
      return cb()
    }

    let effectHandler = this.effectHandlers[value.effect]

    if (typeof effectHandler !== 'function') {
      throw new Error(
        `There is no handler defined for a "${value.effect}" effect`
      )
    }

    value = effectHandler(value, this)

    if (!value || !value.effect) {
      return cb(value)
    }

    switch (value.effect) {
      case '_suspend':
        return value.value

      case '_resolve':
        return this.resolvers.value((resolvedValue) => {
          if (!resolvedValue || !resolvedValue.effect) {
            return cb(resolvedValue)
          }

          return handle.call(this, resolvedValue, cb)
        }, value.value)

      default:
        return handle.call(this, value, cb)
    }
  }, value)
}
