const { sync, asIs, auto } = require('./index');

module.exports = {
  start: asIs,
  resume: sync,
  handle: asIs,
  value: auto,
  complete: asIs
};
