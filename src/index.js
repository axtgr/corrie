const Execution = require('./Execution')
const defaultResolvers = require('../resolvers/auto')
const { normalizeRoutine, normalizeResolvers } = require('./utils')
const compose = require('./compose')

const DEFAULT_SETTINGS = {
  resolvers: defaultResolvers,
  effectHandlers: {
    call: require('./effects/call').handler,
    sleep: require('./effects/sleep').handler,
    resolve: require('./effects/resolve').handler,
    getResume: require('./effects/getResume').handler,
    suspend: require('./effects/suspend').handler,
    return: require('./effects/return').handler,
    yield: require('./effects/resolve').handler,
    throw: require('./effects/throw').handler,
  },
}

function corrie(settings, routine) {
  let { effectHandlers, resolvers } = settings

  resolvers = normalizeResolvers(resolvers)
  routine = normalizeRoutine(routine)

  return function corrieExecution(...args) {
    return new Execution(effectHandlers, resolvers, routine).start(this, args)
  }
}

function setCorrieSettings(settings) {
  return function polymorphicCorrie(...args) {
    if (typeof args[0] === 'object') {
      settings = Object.assign({}, settings, args[0])
      args = args.slice(1)

      if (args.length === 0) {
        return setCorrieSettings(settings)
      }
    }

    if (!settings) {
      throw new Error('Settings are required')
    }

    let routine = args.length > 1 ? compose(args) : args[0]
    return corrie(settings, routine)
  }
}

module.exports = setCorrieSettings(DEFAULT_SETTINGS)
module.exports.Execution = Execution
module.exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS
