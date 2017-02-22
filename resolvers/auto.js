let { sync, asIs, auto } = require('./index');

module.exports = {
  start: asIs,
  step: sync,
  handle: asIs,
  value: auto,
  complete: asIs
};
