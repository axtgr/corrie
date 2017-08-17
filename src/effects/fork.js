const Execution = require('../Execution')
const { normalizeRoutine } = require('../utils')

function fork(routine, ...args) {
  let result = { effect: 'fork', routine }

  if (args.length) {
    result.args = args
  }

  return result
}

function forkHandler(effect, execution) {
  let { routine, args } = effect
  let { effectHandlers, resolvers, state, context } = execution

  return Promise.resolve().then(() => {
    routine = normalizeRoutine(routine)
    let newExecution = new Execution(effectHandlers, resolvers, state, routine)
    return newExecution.start(context, args)
  })
}

module.exports.factory = fork
module.exports.handler = forkHandler
