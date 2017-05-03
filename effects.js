module.exports = {
  call: require('./src/effects/call').factory,
  sleep: require('./src/effects/sleep').factory,
  resolve: require('./src/effects/resolve').factory,
  getResume: require('./src/effects/getResume').factory,
  suspend: require('./src/effects/suspend').factory,
  return: require('./src/effects/return').factory,
  next: (...args) => ({ effect: 'next', args }),
}
