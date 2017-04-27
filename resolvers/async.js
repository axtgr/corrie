const { async, asIs, auto } = require('./index')

module.exports = {
  start: async,
  resume: asIs,
  handle: asIs,
  value: auto,
  complete: asIs,
}
