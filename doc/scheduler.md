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

The `proxyObserver` is created in `observeOn(Rx.Scheduler.async)`, and its `next(val)` function is approximately the following:

```js
var proxyObserver = {
  next: (val) => {
    Rx.Scheduler.async.schedule(
      (x) => finalObserver.next(x),
      0 /* delay */,
      val /* will be the x for the function above */
    );
  },

  // ...
}
```

The `async` Scheduler operates with a `setTimeout` or `setInterval`, even if the given `delay` was zero. As usual, in JavaScript, `setTimeout(fn, 0)` is known to run the function `fn` earliest on the next event loop iteration. This explains why `got value 1` is delivered to the `finalObserver` after `just after subscribe` happened.

The `schedule()` method of a Scheduler takes a `delay` argument, which refers to a quantity of time relative to the Scheduler's own internal clock. A Scheduler's clock need not have any relation to the actual wall-clock time. This is how temporal operators like `delay` operate not on actual time, but on time dictated by the Scheduler's clock. This is specially useful in testing, where a *virtual time Scheduler* may be used to fake wall-clock time while in reality executing scheduled tasks synchronously.

## Scheduler Types

The `async` Scheduler is one of the built-in schedulers provided by RxJS. Each of these can be created and returned by using static properties of the `Scheduler` object.

| Scheduler | Purpose |
| --- | --- |
| `null` | By not passing any scheduler, notifications are delivered synchronously and recursively. Use this for constant-time operations or tail recursive operations. |
| `Rx.Scheduler.queue` | Schedules on a queue in the current event frame (trampoline scheduler). Use this for iteration operations. |
| `Rx.Scheduler.asap` | Schedules on the micro task queue, which uses the fastest transport mechanism available, either Node.js' `process.nextTick()` or Web Worker MessageChannel or setTimeout or others. Use this for asynchronous conversions. |
| `Rx.Scheduler.async` | Schedules work with `setInterval`. Use this for time-based operations. |

## Using Schedulers

You may have already used schedulers in your RxJS code without explicitly stating the type of schedulers to be used. This is because all Observable operators that deal with concurrency have optional schedulers. If you do not provide the scheduler, RxJS will pick a default scheduler by using the principle of least concurrency. This means that the scheduler which introduces the least amount of concurrency that satisfies the needs of the operator is chosen. For example, for operators returning an observable with a finite and small number of messages, RxJS uses no Scheduler, i.e. `null` or `undefined`.  For operators returning a potentially large or infinite number of messages, `queue` Scheduler is used. For operators which use timers, `async` is used.

Because RxJS uses the least concurrency scheduler, you can pick a different scheduler if you want to introduce concurrency for performance purpose.  To specify a particular scheduler, you can use those operator methods that take a scheduler, e.g., `from([10, 20, 30], Rx.Scheduler.async)`.

**Static creation operators usually take a Scheduler as argument.** For instance, `from(array, scheduler)` lets you specify the Scheduler to use when delivering each notification converted from the `array`. It is usually the last argument to the operator. The following static creation operators take a Scheduler argument:

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

**Use `subscribeOn` to schedule in what context will the `subscribe()` call happen.** By default, a `subscribe()` call on an Observable will happen synchronously and immediately. However, you may delay or schedule the actual subscription to happen on a given Scheduler, using the instance operator `subscribeOn(scheduler)`, where `scheduler` is an argument you provide.

**Use `observeOn` to schedule in what context will notifications be delivered.** As we saw in the examples above, instance operator `observeOn(scheduler)` introduces a mediator Observer between the source Observable and the destination Observer, where the mediator schedules calls to the destination Observer using your given `scheduler`.

**Instance operators may take a Scheduler as argument.**

Time-related operators like `bufferTime`, `debounceTime`, `delay`, `auditTime`, `sampleTime`, `throttleTime`, `timeInterval`, `timeout`, `timeoutWith`, `windowTime` all take a Scheduler as the last argument, and otherwise operate by default on the `Rx.Scheduler.async` Scheduler.

Other instance operators that take a Scheduler as argument: `cache`, `combineLatest`, `concat`, `expand`, `merge`, `publishReplay`, `startWith`.

Notice that both `cache` and `publishReplay` accept a Scheduler because they utilize a ReplaySubject. The constructor of a ReplaySubjects takes an optional Scheduler as the last argument because ReplaySubject may deal with time, which only makes sense in the context of a Scheduler. By default, a ReplaySubject uses the `queue` Scheduler to provide a clock.
