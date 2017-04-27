function resolveAuto(cb, value) {
  if (value && typeof value.then === 'function') {
    return cb ? value.then(cb) : value
  }

  return cb ? cb(value) : value
}

function resolveSync(cb, value) {
  if (value && typeof value.then === 'function') {
    throw new Error('Cannot synchronously resolve a promise')
  }

  return cb ? cb(value) : value
}

function resolveAsync(cb, value) {
  if (value && typeof value.then === 'function') {
    return cb ? value.then(cb) : value
  }

  return cb ? Promise.resolve(value).then(cb) : Promise.resolve(value)
}

function resolveAsIs(cb, value) {
  return cb ? cb(value) : value
}

module.exports = {
  auto: resolveAuto,
  sync: resolveSync,
  async: resolveAsync,
  asIs: resolveAsIs,
}
