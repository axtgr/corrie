let Execution = require('./Execution');
let resolvers = require('../resolvers/auto');
let { normalizeRoutine, normalizeResolvers } = require('./utils');


const DEFAULT_SETTINGS = {
  resolvers,
  effects: {
    call: require('./effects/call').handler,
    sleep: require('./effects/sleep').handler,
    resolve: require('./effects/resolve').handler,
    return: require('./effects/return').handler,
    yield: require('./effects/resolve').handler
  }
};


function corrie(settings, routine) {
  routine = normalizeRoutine(routine);
  resolvers = normalizeResolvers(settings.resolvers);

  return function corrieExecution(...args) {
    let execution = new Execution(settings, resolvers, routine);
    return execution.start(this, args);
  };
}

function setCorrieSettings(settings) {
  return function polymorphicCorrie(arg) {
    if (typeof arg === 'object') {
      settings = Object.assign({}, settings, arg);
      return setCorrieSettings(settings);
    }

    if (!settings) {
      throw new Error('Settings are required');
    }

    return corrie(settings, arg);
  };
}


module.exports = setCorrieSettings(DEFAULT_SETTINGS);
