const Execution = require('../Execution')

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

  let value = Promise.resolve().then(() => {
    let newExec = new Execution(effectHandlers, resolvers, state, routine)
    return newExec.start(context, args)
  })
  return value
}

module.exports.factory = fork
module.exports.handler = forkHandler
