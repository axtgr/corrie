# Corrie ![npm-version](https://img.shields.io/npm/v/corrie.svg)

*Scared of side effects? Corrie is here to save the day!*

When a function does not behave, all things could go wrong:

```javascript
function theVillain() {
  setTimeout(() => {
    destroy('world').then(() => {
      console.log('Try to test me now, sucker!')
    })
  }, 1000)
}
```

Corrie employs coroutines (generators) to make functions with side effects nicer:

```javascript
function* theHero() {
  yield sleep(1000)
  yield call(save, 'world')
  yield print('Hold my beer, I got this 😎')
}
```

`sleep`, `call` and `print` here are *effect factories*, simple pure functions that return plain JavaScript objects called *effects*, like this one:

```javascript
{
  effect: 'sleep',
  duration: 1000
}
```

A coroutine yields such objects instead of calling effectful functions directly. These effect objects work as instructions that Corrie picks up and sends to a corresponding *effect handler*. The effect handler fulfills the instruction and then either resumes the coroutine or stops the execution.

Apart from yielding an effect object, a coroutine can also `yield`, `return` or `throw` a non-effect value. These actions are considered a special kind of effects, and are also proccesed by effect handlers. There are a few effects built in Corrie, and you can register your own effect handlers both for regular and special effects.

Coroutines with declarative effects are easy to write and read, and especially to test: you can simply iterate over the yielded effects and check if they are what you expect them to be. This approach also gives you more control over the execution flow.

If you are coming from the React/redux world, Corrie can be described as [redux-saga](https://github.com/redux-saga/redux-saga) sans the redux parts.


## Installation

`npm install --save corrie`


## Usage

```javascript
const corrie = require('corrie')
const { print } = require('corrie/effects')


// This is a pure function
function makeAddressedMessage(addressee, message) {
  return `${addressee}, ${message}`
}

// This is an effectful coroutine
function* talkToTheWorld(message) {
  // By default, yielding a non-effect value will resolve it
  let addressee = yield Promise.resolve('World')

  // Pure functions can be used directly
  let fullMessage = makeAddressedMessage(addressee, message)

  // Since printing a string is a side effect, yield it
  yield print(fullMessage)
}


// Wrap the coroutine and use it like a regular function
let talk = corrie(talkToTheWorld)
talk('hello!') // Outputs "World, hello!"
talk('bye!') // Outputs "World, bye!"
```

## Composition

### Using `yield*`

To invoke a coroutine and yield its effects from another coroutine as if they were yielded directly, use `yield*`:

```javascript
function* first() {
  yield print(2)
}

function* second() {
  yield print(1)
  yield* first() // in this case it's the same as `yield print(2)`
  yield print(3)
}

corrie(second)() // Outputs "1 2 3"
```

### Middleware Pipelines

There is also a special way to compose coroutines that allows you to create pipelines of middleware similar to those from [koa](https://github.com/koajs/koa). To use it, pass more than one coroutine to Corrie, and yield a `next` effect from them to pause the current coroutine and invoke the next one in the queue.

```javascript
function* profile(...args) {
  console.time('hoottooting')
  let result = yield next(...args)
  console.timeEnd('hoottooting')
  return result
}

function* delay(...args) {
  yield sleep(100)
  let result = yield next(...args)
  yield sleep(100)
  return result
}

function* rhyme(string) {
  return string += '-' + string.replace('h', 't'))
}

let pipeline = corrie(profile, delay, rhyme)
let result = pipeline('hoot')
console.log(result)

// hoottooting: 201.949ms
// hoot-toot
```

The `next` effect passes its arguments to the next handler in the queue and returns the result of its invocation. With this technique, the execution first goes downstream, then upstream, allowing every handler to both *preprocess the arguments* and *postproccess the result* of the execution.

This approach is very flexible and allows you to build middleware layers, method hooks, [plugin systems](https://github.com/alex-shnayder/hooter) and other awesome things.


## Built-in Effects

Corrie has several effects built in it, which you can use by importing the needed effect factories like so:

`const { call, sleep } = require('corrie/effects')`

Effects marked as *async* or *potentially async* trigger an error in the `sync` mode.

Effects marked as *special* are invoked by using JavaScript statements with values that are not effect objects.

### `yield` *special*

This effect is triggered when a non-effect value is yielded from a coroutine. By default, it is processed by the `resolve` handler.

```javascript
function* () {
  // These yields will be handled by the `yield` effect handler,
  // and by default work as `yield resolve(value)`
  yield 11
  yield Promise.resolve(22)
  // And these two won't:
  yield { effect: 'sleep', duration: 100 }
  yield suspend()
}
```

### `return` *special*

This effect is triggered when a value is returned from a coroutine. By default, it marks the execution as complete, resolves the value and returns it.

```javascript
function* () {
  return 322 // triggers the effect handler
}
```

### `throw` *special*

This effect is triggered when a value is thrown from a coroutine. By default, it works as a regular throw.

```javascript
function* () {
  throw new Error('ALARM!') // triggers the effect handler
}
```

### `call(fn, ...args)` or `call([context, fn], ...args)` *potentially async*

Invokes a function with the provided context (if given) and arguments. If the returned value is a promise, waits for it to resolve. Returns the result.

```javascript
yield call(console.log, 'Hello', 'world')
yield call([this, doSometing], arg0, arg1)
// This won't work in the `sync` mode:
yield call(functionThatReturnsAPromise, ...args)
```

### `fork(fn, ...args)` or `fork(mode, fn, ...args)` *async*

Executes the given function as a new Corrie routine using the effect handlers, state and context of the current execution. If the mode parameter is not specified, it is set to "auto".

```javascript
yield print(1)
let promise = yield fork('async', function* () {
  yield print(2)
  return 4
})
yield print(3)
let result = yield resolve(promise) // wait for the fork to complete
yield print(result)

// 1, 3, 2, 4
```

### `resolve(value)` *potentially async*

Resolves the provided value (e.g. a promise) and returns the result. This is the default effect for yielding a non-effect value.

```javascript
yield resolve(Promise.resolve(1)) // resolves to 1
yield Promise.resolve(2) // resolves to 2
yield 3 // resolves to 3
```

### `sleep(duration)` *async*

Pauses the invocation for `duration` milliseconds, then resumes it.

```javascript
yield sleep(200)
```

### `getResume()`

Returns a function that resumes the invocation. Although useless by itself, `getResume` can be used together with `suspend` to continue the invocation from outside.

```javascript
function* handler() {
  console.time('hooting')
  let rsm = yield getResume()
  let result = yield suspend(rsm)
  console.log(result)
  console.timeEnd('hooting')
}

// Here `rsm` is the resume function
let rsm = corrie(handler)()
setTimeout(() => rsm('hoot!'), 500)

// hoot!
// hooting: 503.228ms
```

This technique can be used to build such advanced interfaces as the query builder.

### `suspend(value)`

Pauses the invocation of the chain and returns the provided value to the outside. See `getResume` for the example.

### `next(...args)`

When executing a composition of middleware coroutines, pauses the current handler and invokes the next one in the queue passing the provided arguments. Once the next handler is finished, returns its result.

By default, `next` may return `undefined` both as the result value of the next handler and when there is no more handlers in the queue. To get a different value for the no-more-handlers case, use the `or(value)` method of the effect:

```javascript
yield next(...args).or('no more handlers')
```


## Settings

Along with coroutines and theirs arguments, Corrie accepts a settings object. There are two ways to pass settings to Corrie:

* As the *only* argument to the Corrie function: `let newCorrie = corrie(settings)`. It will return a new Corrie function bound to the settings.

```javascript
let syncCorrie = corrie({ mode: 'sync' })
let asyncCorrie = corrie({ mode: 'async' })

function* hey() {
  yield sleep(100) // using async effect
  yield print('Hey!')
}

syncCorrie(hey)() // throws an error
asyncCorrie(hey)() // prints "Hey!"
```

* As the first argument along with coroutines: `corrie(settings, coroutine)`. It will instantly invoke the Corrie function with the provided settings and wrap the coroutines.

```javascript
let coroutine = corrie({ mode: 'async' }, function* () {
  yield print('Hey!')
})

coroutine()
coroutine()
```


## Custom Effects

You can add your own effects by registering their handlers in a settings object with an `effectHandlers` property. Effect factories don't need to be registered, they are merely a nicer user-land way to create effect objects.

Here is an example of using custom effects with Corrie:

```javascript
const corrie = require('corrie')
const { sleep } = require('corrie/effects')
const { buildHandler, destroyHandler } = require('./customEffectHandlers')
const { build, destroy } = require('./customEffectFactories')

const settings = {
  effectHandlers: {
    build: buildHandler,
    destroy: destroyHandler,
    return: buildHandler // use the build handler for returned values
  }
}

const coroutine = function*() {
  yield build('world')
  yield sleep(100000000)
  yield destroy('world')
}

// Reinstantiate corrie with the new settings for repeated use
const customCorrie = corrie(settings)
customCorrie(coroutine)()

// or use them right away
corrie(settings, coroutine)()
```

For examples of effect handlers, see the [built-in ones](src/effects).


## Execution Modes

Corrie supports different execution modes that affect how it treats promises. You can pass a mode as a setting (e.g. `corrie({ mode: 'async'}, ...)`) or use the corresponding method of the main Corrie function.

### `auto`

It is the default mode used when you invoke the main Corrie function. In this mode:

* The execution starts synchronously
* Promises and async effects are allowed
* Promises returned from effects are resolved, and the result is returned to the coroutine
* The return value of the execution can be both a promise and a regular value

```javascript
// The result is a regular value
let result = corrie(function* (a) {
  return a * 2
})(1)

// The result is a promise because `sleep` is an async effect
let promise = corrie(function* (b) {
  yield sleep(100)
  return b * 2
})(2)
```

You can also use the `auto` mode explicitly: `corrie.auto(...)` or `corrie({ mode: 'auto' })`.


### `async`

* The execution starts asynchronously
* Promises and async effects are allowed
* Promises returned from effects are resolved, and the result is returned to the coroutine
* The return value of the execution is always a promise

```javascript
let double = corrie.async(function* (a) {
  return a * 2
})
double(2).then(console.log) // prints "4"
```

### `sync`

* The execution starts synchronously
* Resolving promises and using async effects is disallowed
* Unresolved promises returned from effects are allowed
* The return value of the execution must not be a promise

```javascript
// This will throw an error
corrie({ mode: 'sync' }, function* (a) {
  yield sleep(200)
  return a * 2
})()
```


## State

The state is a JavaScript object with arbitrary properties attached to a Corrie execution. Effect handlers can use this object to store some data. The built-in effects don't use the state, so it is only useful with custom effects.

You can pass a state using the "state" property in settings:

```javascript
// Every coroutine wrapped using this function will have the same initial state
let corrieWithState = corrie({
  state: { foo: 'bar' }
})

// In this case the state is used in one particular coroutine
corrie({
  state: { bar: 'foo' }
}, function* () {
  yield printState()
})()
```


## Credits

[yelouafi](https://github.com/yelouafi) for [redux-saga](https://github.com/redux-saga/redux-saga)


## License

[ISC](LICENSE)
