# Observable (可观察对象)

Observables 是多个值的惰性推送集合。它填补了下面表格中的空白：

| | 单个值 | 多个值 |
| --- | --- | --- |
| **拉取** | [`Function`](https://developer.mozilla.org/en-US/docs/Glossary/Function) | [`Iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) |
| **推送** | [`Promise`](https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Promise) | [`Observable`](../class/es6/Observable.js~Observable.html) |

**示例** - 当订阅下面代码中的 Observable 的时候会立即(同步地)推送值`1`、`2`、`3`，然后1秒后会推送值`4`，再然后是完成流：

```js
var observable = Rx.Observable.create(function (observer) {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  setTimeout(() => {
    observer.next(4);
    observer.complete();
  }, 1000);
});
```

要调用 Observable 并看到这些值，我们需要*订阅* Observable：

```js
var observable = Rx.Observable.create(function (observer) {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  setTimeout(() => {
    observer.next(4);
    observer.complete();
  }, 1000);
});

console.log('just before subscribe');
observable.subscribe({
  next: x => console.log('got value ' + x),
  error: err => console.error('something wrong occurred: ' + err),
  complete: () => console.log('done'),
});
console.log('just after subscribe');
```

控制台执行的结果：

```none
just before subscribe
got value 1
got value 2
got value 3
just after subscribe
got value 4
done
```

## 拉取 (Pull) vs. 推送 (Push)

**拉取**和**推送**是两种不同的协议，用来描述数据**生产者 (Producer)**如何与数据**消费者 (Consumer)**如何进行通信的。

**什么是拉取？** - 在拉取体系中，由消费者来决定何时从生产者那接收数据。生产者本身不知道数据是何时交付到消费者手中的。

每个 JavaScript 函数都是拉取体系。函数是数据的生产者，调用该函数的代码通过从函数调用中“取出”一个**单个**返回值来对该函数进行消费。

ES2105 引入了 [generator 函数和 iterators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) (`function*`)，这是另外一种类型的拉取体系。调用 `iterator.next()` 的代码是消费者，它会从 iterator(生产者) 那“取出”**多个**值。

| | 生产者 | 消费者 |
| --- | --- | --- |
| **拉取** | **被动的:** 当被请求时产生数据。 | **主动的:** 决定何时请求数据。 |
| **推送** | **主动的:** 按自己的节奏产生数据。 | **被动的:** 对收到的数据做出反应。 |

**什么是推送？** - 在推送体系中，由生产者来决定何时把数据发送给消费者。消费者本身不知道何时会接收到数据。

在当今的 JavaScript 世界中，Promises 是最常见的推送体系类型。Promise(生产者) 将一个解析过的值传递给已注册的回调函数(消费者)，但不同于函数的是，由 Promise 来决定何时把值“推送”给回调函数。

RxJS 引入了 Observables，一个新的 JavaScript 推送体系。Observable 是多个值的生产者，并将值“推送”给观察者(消费者)。

- **Function** 是惰性的评估运算，调用时会同步地返回一个单一值。
- **Generator** 是惰性的评估运算，调用时会同步地返回零到(有可能的)无限多个值。
- **Promise** 是最终可能(或可能不)返回单个值的运算。
- **Observable** 是惰性的评估运算，它可以从它被调用的时刻起同步或异步地返回零到(有可能的)无限多个值。

## Observables 作为函数的泛化

与流行的说法正好相反，Observables 既不像 EventEmitters，也不像多个值的 Promises 。在某些情况下，即当使用 RxJS 的 Subjects 进行多播时， Observables 的行为可能会比较像 EventEmitters，但通常情况下 Observables 的行为并不像 EventEmitters 。

<span class="informal">Observables 像是没有参数, 但可以泛化为多个值的函数。</span>

考虑如下代码：

```js
function foo() {
  console.log('Hello');
  return 42;
}

var x = foo.call(); // 等同于 foo()
console.log(x);
var y = foo.call(); // 等同于 foo()
console.log(y);
```

我们期待看到的输出：

```none
"Hello"
42
"Hello"
42
```

你可以使用 Observables 重写上面的代码：

```js
var foo = Rx.Observable.create(function (observer) {
  console.log('Hello');
  observer.next(42);
});

foo.subscribe(function (x) {
  console.log(x);
});
foo.subscribe(function (y) {
  console.log(y);
});
```

输出是一样的:

```none
"Hello"
42
"Hello"
42
```

这是因为函数和 Observables 都是惰性运算。如果你不调用函数，`console.log('Hello')` 就不会执行。Observables 也是如此，如果你不“调用”它(使用 `subscribe`)，`console.log('Hello')` 也不会执行。此外，“调用”或“订阅”是独立的操作：两个函数调用会触发两个单独的副作用，两个 Observable 订阅同样也是触发两个单独的副作用。EventEmitters 共享副作用并且无论是否存在订阅者都会尽早执行，Observables 与之相反，不会共享副作用并且是延迟执行。

<span class="informal">订阅 Observable 类似于调用函数。</span>

一些人声称 Observables 是异步的。那不是真的。如果你用日志包围一个函数调用，像这样：

<!-- skip-example -->
```js
console.log('before');
console.log(foo.call());
console.log('after');
```

你会看到这样的输出:

```none
"before"
"Hello"
42
"after"
```

使用 Observables 来做同样的事：

<!-- skip-example -->
```js
console.log('before');
foo.subscribe(function (x) {
  console.log(x);
});
console.log('after');
```

输出是：

```none
"before"
"Hello"
42
"after"
```

这证明了 `foo` 的订阅完全是同步的，就像函数一样。

<span class="informal">Observables 传递值可以是同步的，也可以是异步的。</span>

那么 Observable 和 函数的区别是什么呢？**Observable 可以随着时间的推移“返回”多个值**，这是函数所做不到的。你无法这样：

```js
function foo() {
  console.log('Hello');
  return 42;
  return 100; // 死代码，永远不会执行
}
```

函数只能返回一个值。但 Observables 可以这样：

```js
var foo = Rx.Observable.create(function (observer) {
  console.log('Hello');
  observer.next(42);
  observer.next(100); // “返回”另外一个值
  observer.next(200); // 还可以再“返回”值
});

console.log('before');
foo.subscribe(function (x) {
  console.log(x);
});
console.log('after');
```

同步输出：

```none
"before"
"Hello"
42
100
200
"after"
```

但你也可以异步地“返回”值：

```js
var foo = Rx.Observable.create(function (observer) {
  console.log('Hello');
  observer.next(42);
  observer.next(100);
  observer.next(200);
  setTimeout(() => {
    observer.next(300); // 异步执行
  }, 1000);
});

console.log('before');
foo.subscribe(function (x) {
  console.log(x);
});
console.log('after');
```

输出：

```none
"before"
"Hello"
42
100
200
"after"
300
```

结论:

- `func.call()` 意思是 "*同步地给我一个值*"
- `observable.subscribe()` 意思是 "*给我任意数量的值，无论是同步还是异步*"

## Observable 剖析

Observables 是使用 `Rx.Observable.create` 或创建操作符**创建的**，并使用观察者来**订阅**它，然后**执行**它并发送 `next` / `error` / `complete` 通知给观察者，而且执行可能会被**清理**。这四个方面全部编码在 Observables 实例中，但某些方面是与其他类型相关的，像 Observer (观察者) 和  Subscription (订阅)。

Observable 的核心关注点：
- **创建** Observables
- **订阅** Observables
- **执行** Observables
- **清理** Observables

### Creating Observables

`Rx.Observable.create` is an alias for the `Observable` constructor, and it takes one argument: the `subscribe` function.

The following example creates an Observable to emit the string `'hi'` every second to an Observer.

```js
var observable = Rx.Observable.create(function subscribe(observer) {
  var id = setInterval(() => {
    observer.next('hi')
  }, 1000);
});
```

<span class="informal">Observables can be created with `create`, but usually we use the so-called [creation operators](./overview.html#creation-operators), like `of`, `from`, `interval`, etc.</span>

In the example above, the `subscribe` function is the most important piece to describe the Observable. Let's look at what subscribing means.

### Subscribing to Observables

The Observable `observable` in the example can be *subscribed* to, like this:

<!-- skip-example -->
```js
observable.subscribe(x => console.log(x));
```

It is not a coincidence that `observable.subscribe` and `subscribe` in `Observable.create(function subscribe(observer) {...})` have the same name. In the library, they are different, but for practical purposes you can consider them conceptually equal.

This shows how `subscribe` calls are not shared among multiple Observers of the same Observable. When calling `observable.subscribe` with an Observer, the function `subscribe` in `Observable.create(function subscribe(observer) {...})` is run for that given Observer. Each call to `observable.subscribe` triggers its own independent setup for that given Observer.

<span class="informal">Subscribing to an Observable is like calling a function, providing callbacks where the data will be delivered to.</span>

This is drastically different to event handler APIs like `addEventListener` / `removeEventListener`. With `observable.subscribe`, the given Observer is not registered as a listener in the Observable. The Observable does not even maintain a list of attached Observers.

A `subscribe` call is simply a way to start an "Observable execution" and deliver values or events to an Observer of that execution.

### Executing Observables

The code inside `Observable.create(function subscribe(observer) {...})` represents an "Observable execution", a lazy computation that only happens for each Observer that subscribes. The execution produces multiple values over time, either synchronously or asynchronously.

There are three types of values an Observable Execution can deliver:

- "Next" notification: sends a value such as a Number, a String, an Object, etc.
- "Error" notification: sends a JavaScript Error or exception.
- "Complete" notification: does not send a value.

Next notifications are the most important and most common type: they represent actual data being delivered to an Observer. Error and Complete notifications may happen only once during the Observable Execution, and there can only be either one of them.

These constraints are expressed best in the so-called *Observable Grammar* or *Contract*, written as a regular expression:

```none
next*(error|complete)?
```

<span class="informal">In an Observable Execution, zero to infinite Next notifications may be delivered. If either an Error or Complete notification is delivered, then nothing else can be delivered afterwards.</span>

The following is an example of an Observable execution that delivers three Next notifications, then completes:

```js
var observable = Rx.Observable.create(function subscribe(observer) {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
});
```

Observables strictly adhere to the Observable Contract, so the following code would not deliver the Next notification `4`:

```js
var observable = Rx.Observable.create(function subscribe(observer) {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
  observer.next(4); // Is not delivered because it would violate the contract
});
```

It is a good idea to wrap any code in `subscribe` with `try`/`catch` block that will deliver an Error notification if it catches an exception:

```js
var observable = Rx.Observable.create(function subscribe(observer) {
  try {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
  } catch (err) {
    observer.error(err); // delivers an error if it caught one
  }
});
```

### Disposing Observable Executions

Because Observable Executions may be infinite, and it's common for an Observer to want to abort execution in finite time, we need an API for canceling an execution. Since each execution is exclusive to one Observer only, once the Observer is done receiving values, it has to have a way to stop the execution, in order to avoid wasting computation power or memory resources.

When `observable.subscribe` is called, the Observer gets attached to the newly created Observable execution. This call also returns an object, the `Subscription`:

<!-- skip-example -->
```js
var subscription = observable.subscribe(x => console.log(x));
```

The Subscription represents the ongoing execution, and has a minimal API which allows you to cancel that execution. Read more about the [`Subscription` type here](./overview.html#subscription). With `subscription.unsubscribe()` you can cancel the ongoing execution:

```js
var observable = Rx.Observable.from([10, 20, 30]);
var subscription = observable.subscribe(x => console.log(x));
// Later:
subscription.unsubscribe();
```

<span class="informal">When you subscribe, you get back a Subscription, which represents the ongoing execution. Just call `unsubscribe()` to cancel the execution.</span>

Each Observable must define how to dispose resources of that execution when we create the Observable using `create()`. You can do that by returning a custom `unsubscribe` function from within `function subscribe()`.

For instance, this is how we clear an interval execution set with `setInterval`:

```js
var observable = Rx.Observable.create(function subscribe(observer) {
  // Keep track of the interval resource
  var intervalID = setInterval(() => {
    observer.next('hi');
  }, 1000);

  // Provide a way of canceling and disposing the interval resource
  return function unsubscribe() {
    clearInterval(intervalID);
  };
});
```

Just like `observable.subscribe` resembles `Observable.create(function subscribe() {...})`, the `unsubscribe` we return from `subscribe` is conceptually equal to `subscription.unsubscribe`. In fact, if we remove the ReactiveX types surrounding these concepts, we're left with rather straightforward JavaScript.

```js
function subscribe(observer) {
  var intervalID = setInterval(() => {
    observer.next('hi');
  }, 1000);

  return function unsubscribe() {
    clearInterval(intervalID);
  };
}

var unsubscribe = subscribe({next: (x) => console.log(x)});

// Later:
unsubscribe(); // dispose the resources
```

The reason why we use Rx types like Observable, Observer, and Subscription is to get safety (such as the Observable Contract) and composability with Operators.
