const Execution = require('../Execution')
const autoResolvers = require('../../resolvers/auto')
const asIsResolvers = require('../../resolvers/asIs')
const syncResolvers = require('../../resolvers/sync')
const asyncResolvers = require('../../resolvers/async')
const { normalizeRoutine, normalizeResolvers } = require('../utils')


const RESOLVERS = {
  auto: autoResolvers,
  asIs: asIsResolvers,
  sync: syncResolvers,
  async: asyncResolvers,
}


function fork(mode, routine, ...args) {
  if (typeof mode === 'function') {
    if (typeof routine !== 'undefined' || args.length) {
      args.unshift(routine)
    }

    routine = mode
    mode = 'auto'
  }

  let effect = { effect: 'fork', mode, routine }

  if (args.length) {
    effect.args = args
  }

  return effect
}

function forkHandler(effect, execution) {
  let { routine, mode, args } = effect
  let { effectHandlers, state, context } = execution
  let resolvers = RESOLVERS[mode]

  if (!resolvers) {
    throw new Error('A valid mode must be provided')
  }

  resolvers = normalizeResolvers(resolvers)
  routine = normalizeRoutine(routine)

  let newExecution = new Execution(effectHandlers, resolvers, state, routine)
  return newExecution.start(context, args)
}

module.exports.factory = fork
module.exports.handler = forkHandler
