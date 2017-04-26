function getResume() {
  return { effect: 'getResume' }
}

function getResumeHandler() {
  let resume = (value) => this.resume(value)
  return resume
}

module.exports.factory = getResume
module.exports.handler = getResumeHandler
