const Execution = require('./Execution')
const autoResolvers = require('../resolvers/auto')
const syncResolvers = require('../resolvers/sync')
const asyncResolvers = require('../resolvers/async')
const { normalizeRoutine, normalizeResolvers } = require('./utils')
const compose = require('./compose')

const DEFAULT_SETTINGS = {
  resolvers: autoResolvers,
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

  return function corrieExecution(...args) {
    return new Execution(effectHandlers, resolvers, routine).start(this, args)
  }
}

function setCorrieSettings(settings) {
  function polymorphicCorrie(...args) {
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

    let routine

    if (args.length > 1) {
      let routines = args.map((r) => normalizeRoutine(r))
      routine = compose(routines)
    } else {
      routine = normalizeRoutine(args[0])
    }

    return corrie(settings, routine)
  }

  polymorphicCorrie.auto = (...routines) => {
    return polymorphicCorrie({ resolvers: autoResolvers }, ...routines)
  }

  polymorphicCorrie.sync = (...routines) => {
    return polymorphicCorrie({ resolvers: syncResolvers }, ...routines)
  }

  polymorphicCorrie.async = (...routines) => {
    return polymorphicCorrie({ resolvers: asyncResolvers }, ...routines)
  }

  return polymorphicCorrie
}

module.exports = setCorrieSettings(DEFAULT_SETTINGS)
module.exports.Execution = Execution
module.exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS
