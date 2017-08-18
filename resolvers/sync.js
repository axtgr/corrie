const { sync, asIs } = require('./index')

module.exports = {
  start: sync,
  resume: asIs,
  handle: sync,
  value: sync,
  complete: sync,
}
