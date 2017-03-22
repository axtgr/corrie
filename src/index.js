const Execution = require('./Execution');
const defaultResolvers = require('../resolvers/auto');
const { normalizeRoutine, normalizeResolvers } = require('./utils');


const DEFAULT_SETTINGS = {
  resolvers: defaultResolvers,
  effects: {
    call: require('./effects/call').handler,
    sleep: require('./effects/sleep').handler,
    resolve: require('./effects/resolve').handler,
    getResume: require('./effects/getResume').handler,
    produce: require('./effects/produce').handler,
    return: require('./effects/return').handler,
    yield: require('./effects/resolve').handler,
    throw: require('./effects/throw').handler
  }
};


function corrie(settings, routine) {
  let { effects, resolvers } = settings;

  resolvers = normalizeResolvers(resolvers);
  routine = normalizeRoutine(routine);

  return function corrieExecution(...args) {
    return new Execution(effects, resolvers, routine).start(this, args);
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
module.exports.Execution = Execution;
module.exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
