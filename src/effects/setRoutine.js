function setRoutineHandler(effect, execution) {
  let { routine } = effect

  if (typeof routine !== 'function') {
    throw new Error('A routine must be a function')
  }

  execution.routine = routine
}

module.exports.handler = setRoutineHandler
