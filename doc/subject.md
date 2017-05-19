# Subject (主体)

**什么是 Subject？** - RxJS Subject 是一种特殊类型的 Observable，它允许将值多播给多个观察者，所以 Subject 是多播的，而普通的 Observables 是单播的(每个已订阅的观察者都拥有 Observable 的独立执行)。

<span class="informal">Subject 像是 Observalbe，但是可以多播给多个观察者。Subject 还像是 EventEmitters，维护着多个监听器的注册表。</span>

**每个 Subject 都是 Observable 。** - 对于 Subject，你可以提供一个观察者并使用 `subscribe` 方法，就可以开始正常接收值。从观察者的角度而言，它无法判断 Observable 执行是来自普通的 Observable 还是 Subject 。

在 Subject 的内部，`subscribe` 不会调用发送值的新执行。它只是将给定的观察者注册到观察者列表中，类似于其他库或语言中的 `addListener` 的工作方式。

**每个 Subject 都是观察者。** - Subject 是一个有如下方法的对象： `next(v)`、`error(e)` 和 `complete()` 。要给 Subjetc 提供新值，只要调用 `next(theValue)`，它会将值多播给已注册监听该 Subject 的观察者们。

在下面的示例中，我们为 Subject 添加了两个观察者，然后给 Subject 提供一些值：

```js
var subject = new Rx.Subject();

subject.subscribe({
  next: (v) => console.log('observerA: ' + v)
});
subject.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

subject.next(1);
subject.next(2);
```

下面是控制台的输出：

```none
observerA: 1
observerB: 1
observerA: 2
observerB: 2
```

因为 Subject 是观察者，这也就在意味着你可以把 Subject 作为参数传给任何 Observable 的 `subscribe` 方法，如下面的示例所展示的：

```js
var subject = new Rx.Subject();

subject.subscribe({
  next: (v) => console.log('observerA: ' + v)
});
subject.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

var observable = Rx.Observable.from([1, 2, 3]);

observable.subscribe(subject); // 你可以提供一个 Subject 进行订阅
```

执行结果：

```none
observerA: 1
observerB: 1
observerA: 2
observerB: 2
observerA: 3
observerB: 3
```

使用上面的方法，我们基本上只是通过 Subject 将单播的 Observable 执行转换为多播的。这也说明了 Subjects 是将任意 Observable 执行共享给多个观察者的唯一方式。

还有一些特殊类型的 `Subject`：`BehaviorSubject`、`ReplaySubject` 和 `AsyncSubject`。

## 多播的 Observables

“多播 Observable” 通过 Subject 来发送通知，这个 Subject 可能有多个订阅者，然而普通的 “单播 Observable” 只发送通知给单个观察者。

<span class="informal">多播 Observable 在底层是通过使用 Subject 使得多个观察者可以看见同一个 Observable 执行。</span>

在底层，这就是 `multicast` 操作符的工作原理：观察者订阅一个基础的 Subject，然后 Subject 订阅源 Observable 。下面的示例与前面使用 `observable.subscribe(subject)` 的示例类似：

```js
var source = Rx.Observable.from([1, 2, 3]);
var subject = new Rx.Subject();
var multicasted = source.multicast(subject);

// 在底层使用了 `subject.subscribe({...})`:
multicasted.subscribe({
  next: (v) => console.log('observerA: ' + v)
});
multicasted.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

// 在底层使用了 `source.subscribe(subject)`:
multicasted.connect();
```

`multicast` 操作符返回一个 Observable，它看起来很普通的 Observable 没什么区别，但当订阅时就像是 Subject 。`multicast` 返回的是 `ConnectableObservable`，它只是一个有 `connect()` 方法的 Observable 。

`connect()` 方法十分重要，它决定了何时启动共享的 Observable 执行。因为 `connect()` 方法在底层执行了 `source.subscribe(subject)`，所以它返回的是 Subscription，你可以取消订阅以取消共享的 Observable 执行。

### 引用计数

手动调用 `connect()` 并处理 Subscription 通常太笨重。通常，当第一个观察者到达时我们想要*自动地*连接，而当最后一个观察者取消订阅时我们想要*自动地*取消共享执行。

请考虑以下示例，下面的列表概述了 Subscriptions 发生的经过：

1. 第一个观察者订阅了多播 Observable
2. **多播 Observable 已连接**
3. `next` 值 `0` 发送给第一个观察者
4. 第二个观察者订阅了多播 Observable
5. `next` 值 `1` 发送给第一个观察者
6. `next` 值 `1` 发送给第二个观察者
7. 第一个观察者取消了多播 Observable 的订阅
8. `next` 值 `2` 发送给第二个观察者
9. 第二个观察者取消了多播 Observable 的订阅
10. **多播 Observable 的连接已中断(底层进行的操作是取消订阅)**

要实现这点，需要显示地调用 `connect()`，代码如下：

```js
var source = Rx.Observable.interval(500);
var subject = new Rx.Subject();
var multicasted = source.multicast(subject);
var subscription1, subscription2, subscriptionConnect;

subscription1 = multicasted.subscribe({
  next: (v) => console.log('observerA: ' + v)
});
// 这里我们应该调用 `connect()`，因为 `multicasted` 的第一个
// 订阅者关心消费值
subscriptionConnect = multicasted.connect();

setTimeout(() => {
  subscription2 = multicasted.subscribe({
    next: (v) => console.log('observerB: ' + v)
  });
}, 600);

setTimeout(() => {
  subscription1.unsubscribe();
}, 1200);

// 这里我们应该取消共享的 Observable 执行的订阅，
// 因为此后 `multicasted` 将不再有订阅者
setTimeout(() => {
  subscription2.unsubscribe();
  subscriptionConnect.unsubscribe(); // 用于共享的 Observable 执行
}, 2000);
```

如果不想显示调用 `connect()`，我们可以使用 ConnectableObservable 的 `refCount()` 方法(引用计数)，这个方法返回 Observable，这个 Observable 会追踪有多少个订阅者。当订阅者的数量从`0`变成`1`，它会调用 `connect()` 以开启共享的执行。当订阅者数量从`1`变成`0`时，它会完全取消订阅，停止进一步的执行。

<span class="informal">`refCount` 的作用是，当有第一个订阅者时，多播 Observable 会自动地启动执行，而当最后一个订阅者离开时，多播 Observable 会自动地停止执行。</span>

示例如下：

```js
var source = Rx.Observable.interval(500);
var subject = new Rx.Subject();
var refCounted = source.multicast(subject).refCount();
var subscription1, subscription2, subscriptionConnect;

// 这里其实调用了 `connect()`，因为 `refCounted` 有了第一个订阅者
console.log('observerA subscribed');
subscription1 = refCounted.subscribe({
  next: (v) => console.log('observerA: ' + v)
});

setTimeout(() => {
  console.log('observerB subscribed');
  subscription2 = refCounted.subscribe({
    next: (v) => console.log('observerB: ' + v)
  });
}, 600);

setTimeout(() => {
  console.log('observerA unsubscribed');
  subscription1.unsubscribe();
}, 1200);

// This is when the shared Observable execution will stop, because
// `refCounted` would have no more subscribers after this
setTimeout(() => {
  console.log('observerB unsubscribed');
  subscription2.unsubscribe();
}, 2000);
```

Which executes with the output:

```none
observerA subscribed
observerA: 0
observerB subscribed
observerA: 1
observerB: 1
observerA unsubscribed
observerB: 2
observerB unsubscribed
```

The `refCount()` method only exists on ConnectableObservable, and it returns an `Observable`, not another ConnectableObservable.

## BehaviorSubject

One of the variants of Subjects is the `BehaviorSubject`, which has a notion of "the current value". It stores the latest value emitted to its consumers, and whenever a new Observer subscribes, it will immediately receive the "current value" from the `BehaviorSubject`.

<span class="informal">BehaviorSubjects are useful for representing "values over time". For instance, an event stream of birthdays is a Subject, but the stream of a person's age would be a BehaviorSubject.</span>

In the following example, the BehaviorSubject is initialized with the value `0` which the first Observer receives when it subscribes. The second Observer receives the value `2` even though it subscribed after the value `2` was sent.

```js
var subject = new Rx.BehaviorSubject(0); // 0 is the initial value

subject.subscribe({
  next: (v) => console.log('observerA: ' + v)
});

subject.next(1);
subject.next(2);

subject.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

subject.next(3);
```

With output:

```none
observerA: 0
observerA: 1
observerA: 2
observerB: 2
observerA: 3
observerB: 3
```

## ReplaySubject

A `ReplaySubject` is similar to a `BehaviorSubject` in that it can send old values to new subscribers, but it can also *record* a part of the Observable execution.

<span class="informal">A `ReplaySubject` records multiple values from the Observable execution and replays them to new subscribers.</span>

When creating a `ReplaySubject`, you can specify how many values to replay:

```js
var subject = new Rx.ReplaySubject(3); // buffer 3 values for new subscribers

subject.subscribe({
  next: (v) => console.log('observerA: ' + v)
});

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

subject.next(5);
```

With output:

```none
observerA: 1
observerA: 2
observerA: 3
observerA: 4
observerB: 2
observerB: 3
observerB: 4
observerA: 5
observerB: 5
```

You can also specify a *window time* in milliseconds, besides of the buffer size, to determine how old the recorded values can be. In the following example we use a large buffer size of `100`, but a window time parameter of just `500` milliseconds.

<!-- skip-example -->
```js
var subject = new Rx.ReplaySubject(100, 500 /* windowTime */);

subject.subscribe({
  next: (v) => console.log('observerA: ' + v)
});

var i = 1;
setInterval(() => subject.next(i++), 200);

setTimeout(() => {
  subject.subscribe({
    next: (v) => console.log('observerB: ' + v)
  });
}, 1000);
```

With the following output where the second Observer gets events `3`, `4` and `5` that happened in the last `500` milliseconds prior to its subscription:

```none
observerA: 1
observerA: 2
observerA: 3
observerA: 4
observerA: 5
observerB: 3
observerB: 4
observerB: 5
observerA: 6
observerB: 6
...
```

## AsyncSubject

The AsyncSubject is a variant where only the last value of the Observable execution is sent to its observers, and only when the execution completes.

```js
var subject = new Rx.AsyncSubject();

subject.subscribe({
  next: (v) => console.log('observerA: ' + v)
});

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

subject.next(5);
subject.complete();
```

With output:

```none
observerA: 5
observerB: 5
```

The AsyncSubject is similar to the [`last()`](../class/es6/Observable.js~Observable.html#instance-method-last) operator, in that it waits for the `complete` notification in order to deliver a single value.
