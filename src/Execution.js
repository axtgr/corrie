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

    return this.resolvers.start((err) => {
      if (err) {
        throw err
      }

      return this.resume()
    })
  }

  resume(nextValue, throwNext) {
    return this.resolvers.resume((err, nextValue) => {
      if (err) {
        return this.resume(err, true)
      }

      if (this.status === 'completed') {
        if (throwNext) {
          throw nextValue
        } else {
          return nextValue
        }
      }

      if (this.status !== 'started') {
        throw new Error(`Cannot resume an execution that is ${this.status}`)
      }

      let value, done

      try {
        let result = throwNext ?
          this.iterator.throw(nextValue) :
          this.iterator.next(nextValue)
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

      return handle.call(this, value, (err, handledValue) => {
        if (this.status === 'completed') {
          if (err) {
            throw err
          } else {
            return handledValue
          }
        }

        if (done) {
          if (err) {
            throw err
          } else {
            return this.complete(handledValue)
          }
        } else {
          return err ? this.resume(err, true) : this.resume(handledValue)
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

    return this.resolvers.complete((err, value) => {
      if (err) {
        throw err
      }

      this.status = 'completed'
      return value
    }, value)
  }
}

function handle(value, cb) {
  return this.resolvers.handle((err, value) => {
    if (err) {
      return cb(err)
    }

    if (value.effect === 'next') {
      // The "next" effect is handled in compose, hence this workaround.
      // Would it be better if it was a regular effect?
      return cb(null, value.orValue)
    }

    let effectHandler = this.effectHandlers[value.effect]

    if (typeof effectHandler !== 'function') {
      let err = new Error(
        `There is no handler defined for a "${value.effect}" effect`
      )
      return cb(err)
    }

    try {
      value = effectHandler(value, this)
    } catch (err) {
      return cb(err)
    }

    if (!value || !value.effect) {
      return cb(null, value)
    }

    switch (value.effect) {
      case '_suspend':
        return value.value

      case '_resolve':
        return this.resolvers.value((err, resolvedValue) => {
          if (err) {
            return cb(err)
          }

          if (!resolvedValue || !resolvedValue.effect) {
            return cb(null, resolvedValue)
          }

          return handle.call(this, resolvedValue, cb)
        }, value.value)

      default:
        return handle.call(this, value, cb)
    }
  }, value)
}
