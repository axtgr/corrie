const GENERATOR_PROTO = Object.getPrototypeOf(function*() {});

function normalizeRoutine(routine) {
  if (GENERATOR_PROTO.isPrototypeOf(routine)) {
    return routine;
  }

  return function* generatorRoutine(...args) {
    return routine.apply(this, args);
  };
}

function normalizeResolvers(resolvers) {
  let givenType = typeof resolvers;

  if (givenType === 'function') {
    return {
      start: resolvers,
      step: resolvers,
      handle: resolvers,
      value: resolvers,
      complete: resolvers
    };
  }

  if (givenType === 'object') {
    if (!resolvers.start || !resolvers.step || !resolvers.handle || !resolvers.value || !resolvers.complete) {
      throw new Error('"start", "step", "handle", "value" and "complete" resolvers are required');
    }

    return resolvers;
  }

  throw new TypeError('Resolvers must be either an object or a function');
}

module.exports = { normalizeRoutine, normalizeResolvers };
