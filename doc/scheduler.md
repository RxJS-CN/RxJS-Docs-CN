# Scheduler (调度器)

**什么是调度器？** - 调度器控制着何时启动 subscription 和何时发送通知。它由三部分组成：

- **调度器是一种数据结构。** 它知道如何根据优先级或其他标准来存储任务和将任务进行排序。
- **调度器是执行上下文。**  它表示在何时何地执行任务(举例来说，立即的，或另一种回调函数机制(比如 setTimeout 或 process.nextTick)，或动画帧)。
- **调度器有一个(虚拟的)时钟。** 调度器功能通过它的 getter 方法 `now()` 提供了“时间”的概念。在具体调度器上安排的任务将严格遵循该时钟所表示的时间。

<span class="informal">调度器可以让你规定 Observable 在什么样的执行上下文中发送通知给它的观察者。</span>

在下面的示例中，我们采用普通的 Observable ，它同步地发出值`1`、`2`、`3`，并使用操作符 `observeOn` 来指定 `async` 调度器发送这些值。

```js
var observable = Rx.Observable.create(function (observer) {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
})
.observeOn(Rx.Scheduler.async);

console.log('just before subscribe');
observable.subscribe({
  next: x => console.log('got value ' + x),
  error: err => console.error('something wrong occurred: ' + err),
  complete: () => console.log('done'),
});
console.log('just after subscribe');
```

输出结果：

```none
just before subscribe
just after subscribe
got value 1
got value 2
got value 3
done
```

注意通知 `got value...` 在 `just after subscribe` 之后才发送，这与我们到目前为止所见的默认行为是不一样的。这是因为 `observeOn(Rx.Scheduler.async)` 在 `Observable.create` 和最终的观察者之间引入了一个代理观察者。在下面的示例代码中，我们重命名了一些标识符，使得其中的区别变得更明显：

```js
var observable = Rx.Observable.create(function (proxyObserver) {
  proxyObserver.next(1);
  proxyObserver.next(2);
  proxyObserver.next(3);
  proxyObserver.complete();
})
.observeOn(Rx.Scheduler.async);

var finalObserver = {
  next: x => console.log('got value ' + x),
  error: err => console.error('something wrong occurred: ' + err),
  complete: () => console.log('done'),
};

console.log('just before subscribe');
observable.subscribe(finalObserver);
console.log('just after subscribe');
```

`proxyObserver` 是在 `observeOn(Rx.Scheduler.async)` 中创建的，它的 `next(val)` 函数大概是下面这样子的：

```js
var proxyObserver = {
  next: (val) => {
    Rx.Scheduler.async.schedule(
      (x) => finalObserver.next(x),
      0 /* 延迟时间 */,
      val /* 会作为上面函数所使用的 x */
    );
  },

  // ...
}
```

`async` 调度器操作符使用了 `setTimeout` 或 `setInterval`，即使给定的`延迟时间`为0。照例，在 JavaScript 中，我们已知的是 `setTimeout(fn, 0)` 会在下一次事件循环迭代的最开始运行 `fn` 。这也解释了为什么发送给 `finalObserver` 的 `got value 1` 发生在 `just after subscribe` 之后。

调度器的 `schedule()` 方法接收一个 `delay` 参数，它指的是相对于调度器内部时钟的一段时间。调度器的时钟不需要与实际的挂钟时间有任何关系。这也就是为什么像 `delay` 这样的时间操作符不是在实际时间上操作的，而是取决于调度器的时钟时间。这在测试中极其有用，可以使用**虚拟时间调度器**来伪造挂钟时间，同时实际上是在同步执行计划任务。

## 调度器类型

`async` 调度器是 RxJS 提供的内置调度器中的一个。可以通过使用 `Scheduler` 对象的静态属性创建并返回其中的每种类型的调度器。

| 调度器 | 目的 |
| --- | --- |
| `null` | 不传递任何调度器的话，会以同步递归的方式发送通知。用于定时操作或尾递归操作。|
| `Rx.Scheduler.queue` | 当前事件帧中的队列调度(蹦床调度器)。用于迭代操作。|
| `Rx.Scheduler.asap` | 微任务的队列调度，它使用可用的最快速的传输机制，比如 Node.js 的 `process.nextTick()` 或 Web Worker 的 MessageChannel 或 setTimeout 或其他。用于异步转换。 |
| `Rx.Scheduler.async` | 使用 `setInterval` 的调度。用于基于时间的操作符。 |

## 使用调度器

你可能在你的 RxJS 代码中已经使用过调度器了，只是没有明确地指明要使用的调度器的类型。这是因为所有的 Observable 操作符处理并发性都有可选的调度器。如果没有提供调度器的话，RxJS 会通过使用最小并发原则选择一个默认调度器。这意味着引入满足操作符需要的最小并发量的调度器会被选择。例如，对于返回有限和少量消息的 observable 的操作符，RxJS 不使用调度器，即 `null` 或 `undefined` 。对于返回潜在大量的或无限数量的消息的操作符，使用 `queue` 调度器。对于使用定时器的操作符，使用 `aysnc` 调度器。

因为 RxJS 使用最少的并发调度器，如果出于性能考虑，你想要引入并发，那么可以选择不同的调度器。要指定具体的调度器，可以使用那些采用调度器的操作符方法，例如 `from([10, 20, 30], Rx.Scheduler.async)` 。

**静态创建操作符通常可以接收调度器作为参数。** 举例来说，`from(array, scheduler)` 可以让你指定调度器，当发送从 `array` 转换的每个通知的时候使用。调度器通常作为操作符的最后一个参数。下面的静态创建操作符接收调度器参数：

- `bindCallback`
- `bindNodeCallback`
- `combineLatest`
- `concat`
- `empty`
- `from`
- `fromPromise`
- `interval`
- `merge`
- `of`
- `range`
- `throw`
- `timer`

**使用 `subscribeOn` 来调度 `subscribe()` 调用在什么样的上下文中执行。** 默认情况下，Observable 的 `subscribe()` 调用会立即同步地执行。然而，你可能会延迟或安排在给定的调度器上执行实际的 subscription ，使用实例操作符 `subscribeOn(scheduler)`，其中 `scheduler` 是你提供的参数。

**使用 `observeOn` 来调度发送通知的的上下文。** 正如我们在上面的示例中所看到的，实例操作符 `observeOn(scheduler)` 在源 Observable 和目标观察者之间引入了一个中介观察者，中介负责调度，它使用给定的 `scheduler` 来调用目标观察者。

**实例操作符可能会接收调度器作为参数。**

像 `bufferTime`、`debounceTime`、`delay`、`auditTime`、`sampleTime`、`throttleTime`、`timeInterval`、`timeout`、`timeoutWith`、`windowTime` 这样时间相关的操作符全部接收调度器作为最后的参数，并且默认的操作是在 `Rx.Scheduler.async` 调度器上。

其他接收调度器作为参数的实例操作符：`cache`、`combineLatest`、`concat`、`expand`、`merge`、`publishReplay`、`startWith`。

注意，`cache` 和 `publishReplay` 都接收调度器是因为它们使用了 ReplaySubject 。ReplaySubjects 的构造函数接收一个可选的调度器作为最后的参数，因为 ReplaySubject 可能会处理时间，这只在调度器的上下文中才有意义。默认情况下，ReplaySubject 使用 `queue` 调度器来提供时钟。
