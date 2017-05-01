function getResume() {
  return { effect: 'getResume' }
}

function getResumeHandler(effect, execution) {
  return (value) => execution.resume(value)
}

module.exports.factory = getResume
module.exports.handler = getResumeHandler
