function produce(value) {
  return { effect: 'produce', value };
}

function produceHandler(effect) {
  return { effect: '_produce', value: effect.value };
}

module.exports.factory = produce;
module.exports.handler = produceHandler;
