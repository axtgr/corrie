function resolveAuto(cb, value) {
  if (value && typeof value.then === 'function') {
    return cb ? value.then((v) => cb(null, v), cb) : value
  }

  return cb ? cb(null, value) : value
}

function resolveSync(cb, value) {
  if (value && typeof value.then === 'function') {
    let err = new Error('Cannot synchronously resolve a promise')

    if (cb) {
      return cb(err)
    } else {
      throw err
    }
  }

  return cb ? cb(null, value) : value
}

function resolveAsync(cb, value) {
  if (!value || typeof value.then !== 'function') {
    value = Promise.resolve(value)
  }

  return cb ? value.then((v) => cb(null, v), cb) : value
}

function resolveAsIs(cb, value) {
  return cb ? cb(null, value) : value
}

module.exports = {
  auto: resolveAuto,
  sync: resolveSync,
  async: resolveAsync,
  asIs: resolveAsIs,
}
