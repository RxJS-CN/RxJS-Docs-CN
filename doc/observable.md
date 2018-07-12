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

**拉取**和**推送**是两种不同的协议，用来描述数据**生产者 (Producer)**如何与数据**消费者 (Consumer)**进行通信的。

**什么是拉取？** - 在拉取体系中，由消费者来决定何时从生产者那里接收数据。生产者本身不知道数据是何时交付到消费者手中的。

每个 JavaScript 函数都是拉取体系。函数是数据的生产者，调用该函数的代码通过从函数调用中“取出”一个**单个**返回值来对该函数进行消费。

ES2015 引入了 [generator 函数和 iterators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) (`function*`)，这是另外一种类型的拉取体系。调用 `iterator.next()` 的代码是消费者，它会从 iterator(生产者) 那“取出”**多个**值。

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

### 创建 Observables

`Rx.Observable.create` 是 `Observable` 构造函数的别名，它接收一个参数：`subscribe` 函数。

下面的示例创建了一个 Observable，它每隔一秒会向观察者发送字符串 `'hi'` 。

```js
var observable = Rx.Observable.create(function subscribe(observer) {
  var id = setInterval(() => {
    observer.next('hi')
  }, 1000);
});
```

<span class="informal">Observables 可以使用 `create` 来创建, 但通常我们使用所谓的[创建操作符](./overview.html#creation-operators), 像 `of`、`from`、`interval`、等等。</span>

在上面的示例中，`subscribe` 函数是用来描述 Observable 最重要的一块。我们来看下订阅是什么意思。

### 订阅 Observables

示例中的 Observable 对象 `observable` 可以**订阅**，像这样：

<!-- skip-example -->
```js
observable.subscribe(x => console.log(x));
```

`observable.subscribe` 和 `Observable.create(function subscribe(observer) {...})` 中的 `subscribe` 有着同样的名字，这并不是一个巧合。在库中，它们是不同的，但从实际出发，你可以认为在概念上它们是等同的。

这表明 `subscribe` 调用在同一 Observable 的多个观察者之间是不共享的。当使用一个观察者调用 `observable.subscribe` 时，`Observable.create(function subscribe(observer) {...})` 中的 `subscribe` 函数只服务于给定的观察者。对 `observable.subscribe` 的每次调用都会触发针对给定观察者的独立设置。

<span class="informal">订阅 Observable 像是调用函数, 并提供接收数据的回调函数。</span>

这与像 `addEventListener` / `removeEventListener` 这样的事件处理方法 API 是完全不同的。使用 `observable.subscribe`，在 Observable 中不会将给定的观察者注册为监听器。Observable 甚至不会去维护一个附加的观察者列表。

`subscribe` 调用是启动 “Observable 执行”的一种简单方式， 并将值或事件传递给本次执行的观察者。

### 执行 Observables

`Observable.create(function subscribe(observer) {...})` 中`...`的代码表示 “Observable 执行”，它是惰性运算，只有在每个观察者订阅后才会执行。随着时间的推移，执行会以同步或异步的方式产生多个值。

Observable 执行可以传递三种类型的值：

- "Next" 通知： 发送一个值，比如数字、字符串、对象，等等。
- "Error" 通知： 发送一个 JavaScript 错误 或 异常。
- "Complete" 通知： 不再发送任何值。

"Next" 通知是最重要，也是最常见的类型：它们表示传递给观察者的实际数据。"Error" 和 "Complete" 通知可能只会在 Observable 执行期间发生一次，并且只会执行其中的一个。

这些约束用所谓的* Observable 语法*或*合约*表达最好，写为正则表达式是这样的：

```none
next*(error|complete)?
```

<span class="informal">在 Observable 执行中, 可能会发送零个到无穷多个 "Next" 通知。如果发送的是 "Error" 或  "Complete" 通知的话，那么之后不会再发送任何通知了。</span>

下面是 Observable 执行的示例，它发送了三个 "Next" 通知，然后是 "Complete" 通知：

```js
var observable = Rx.Observable.create(function subscribe(observer) {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
});
```

Observable 严格遵守自身的规约，所以下面的代码不会发送 "Next" 通知 `4`：

```js
var observable = Rx.Observable.create(function subscribe(observer) {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
  observer.next(4); // 因为违反规约，所以不会发送
});
```

在 `subscribe` 中用 `try`/`catch` 代码块来包裹任意代码是个不错的主意，如果捕获到异常的话，会发送 "Error" 通知：

```js
var observable = Rx.Observable.create(function subscribe(observer) {
  try {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
  } catch (err) {
    observer.error(err); // 如果捕获到异常会发送一个错误
  }
});
```

### 清理 Observable 执行

因为 Observable 执行可能会是无限的，并且观察者通常希望能在有限的时间内中止执行，所以我们需要一个 API 来取消执行。因为每个执行都是其对应观察者专属的，一旦观察者完成接收值，它必须要一种方法来停止执行，以避免浪费计算能力或内存资源。

当调用了 `observable.subscribe` ，观察者会被附加到新创建的 Observable 执行中。这个调用还返回一个对象，即 `Subscription` (订阅)：

<!-- skip-example -->
```js
var subscription = observable.subscribe(x => console.log(x));
```

Subscription 表示进行中的执行，它有最小化的 API 以允许你取消执行。想了解更多订阅相关的内容，请参见 [`Subscription` 类型](./overview.html#subscription)。使用 `subscription.unsubscribe()` 你可以取消进行中的执行：

```js
var observable = Rx.Observable.from([10, 20, 30]);
var subscription = observable.subscribe(x => console.log(x));
// 稍后：
subscription.unsubscribe();
```

<span class="informal">当你订阅了 Observable，你会得到一个 Subscription ，它表示进行中的执行。只要调用 `unsubscribe()` 方法就可以取消执行。</span>

当我们使用 `create()` 方法创建 Observable 时，Observable 必须定义如何清理执行的资源。你可以通过在 `function subscribe()` 中返回一个自定义的 `unsubscribe` 函数。

举例来说，这是我们如何清理使用了 `setInterval` 的 interval 执行集合：

```js
var observable = Rx.Observable.create(function subscribe(observer) {
  // 追踪 interval 资源
  var intervalID = setInterval(() => {
    observer.next('hi');
  }, 1000);

  // 提供取消和清理 interval 资源的方法
  return function unsubscribe() {
    clearInterval(intervalID);
  };
});
```

正如 `observable.subscribe` 类似于 `Observable.create(function subscribe() {...})`，从 `subscribe` 返回的 `unsubscribe` 在概念上也等同于 `subscription.unsubscribe`。事实上，如果我们抛开围绕这些概念的 ReactiveX 类型，保留下来的只是相当简单的 JavaScript 。

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

// 稍后：
unsubscribe(); // 清理资源
```

为什么我们要使用像 Observable、Observer 和 Subscription 这样的 Rx 类型？原因是保证代码的安全性(比如 Observable 规约)和操作符的可组合性。
