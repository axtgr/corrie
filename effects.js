module.exports = {
  call: require('./src/effects/call').factory,
  fork: require('./src/effects/fork').factory,
  sleep: require('./src/effects/sleep').factory,
  print: require('./src/effects/print').factory,
  resolve: require('./src/effects/resolve').factory,
  getResume: require('./src/effects/getResume').factory,
  suspend: require('./src/effects/suspend').factory,
  return: require('./src/effects/return').factory,
  next: require('./src/effects/next').factory,
}
