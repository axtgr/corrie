const Execution = require('../Execution')

function fork(routine, ...args) {
  return { effect: 'fork', routine, args }
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
