module.exports = {
  call: require('./src/effects/call').factory,
  sleep: require('./src/effects/sleep').factory,
  resolve: require('./src/effects/resolve').factory,
  getResume: require('./src/effects/getResume').factory,
  produce: require('./src/effects/produce').factory,
  return: require('./src/effects/return').factory
};
