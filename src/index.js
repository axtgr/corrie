const Execution = require('./Execution')
const autoResolvers = require('../resolvers/auto')
const asIsResolvers = require('../resolvers/asIs')
const syncResolvers = require('../resolvers/sync')
const asyncResolvers = require('../resolvers/async')
const { normalizeRoutine, normalizeResolvers } = require('./utils')
const compose = require('./compose')

const RESOLVERS = {
  auto: autoResolvers,
  asIs: asIsResolvers,
  sync: syncResolvers,
  async: asyncResolvers,
}
const DEFAULT_SETTINGS = {
  mode: 'auto',
  effectHandlers: {
    call: require('./effects/call').handler,
    fork: require('./effects/fork').handler,
    sleep: require('./effects/sleep').handler,
    print: require('./effects/print').handler,
    resolve: require('./effects/resolve').handler,
    getResume: require('./effects/getResume').handler,
    suspend: require('./effects/suspend').handler,
    return: require('./effects/return').handler,
    yield: require('./effects/resolve').handler,
    throw: require('./effects/throw').handler,
  },
}

function corrie(settings, routine) {
  let { effectHandlers, mode, resolvers, state } = settings

  resolvers = resolvers || RESOLVERS[mode]

  if (!resolvers) {
    throw new Error('Either resolvers or a valid mode must be provided')
  }

  resolvers = normalizeResolvers(resolvers)

  return function corrieExecution(...args) {
    let execution = new Execution(effectHandlers, resolvers, state, routine)
    return execution.start(this, args)
  }
}

function setCorrieSettings(settings) {
  function polymorphicCorrie(...args) {
    let finalSettings = settings

    if (typeof args[0] === 'object') {
      finalSettings = Object.assign({}, settings, args[0])
      args = args.slice(1)

      if (args.length === 0) {
        return setCorrieSettings(finalSettings)
      }
    }

    if (!finalSettings) {
      throw new Error('Settings are required')
    }

    let routine

    if (args.length > 1) {
      let routines = args.map((r) => normalizeRoutine(r))
      routine = compose(routines)
    } else {
      routine = normalizeRoutine(args[0])
    }

    return corrie(finalSettings, routine)
  }

  polymorphicCorrie.auto = (...routines) => {
    return polymorphicCorrie({ resolvers: autoResolvers }, ...routines)
  }

  polymorphicCorrie.asIs = (...routines) => {
    return polymorphicCorrie({ resolvers: asIsResolvers }, ...routines)
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
