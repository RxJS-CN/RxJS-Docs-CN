# Subscription (订阅)

**什么是 Subscription ？** - Subscription 是表示可清理资源的对象，通常是 Observable 的执行。Subscription 有一个重要的方法，即 `unsubscribe`，它不需要任何参数，只是用来清理由 Subscription 占用的资源。在上一个版本的 RxJS 中，Subscription 叫做 "Disposable" (可清理对象)。

```js
var observable = Rx.Observable.interval(1000);
var subscription = observable.subscribe(x => console.log(x));
// 稍后：
// 这会取消正在进行中的 Observable 执行
// Observable 执行是通过使用观察者调用 subscribe 方法启动的
subscription.unsubscribe(); 
```

<span class="informal"> Subscription 基本上只有一个 `unsubscribe()` 函数，这个函数用来释放资源或去取消 Observable 执行。</span>

Subscription 还可以合在一起，这样一个 Subscription 调用 `unsubscribe()` 方法，可能会有多个 Subscription 取消订阅 。你可以通过把一个 Subscription  添加到另一个上面来做这件事：

```js
var observable1 = Rx.Observable.interval(400);
var observable2 = Rx.Observable.interval(300);

var subscription = observable1.subscribe(x => console.log('first: ' + x));
var childSubscription = observable2.subscribe(x => console.log('second: ' + x));

subscription.add(childSubscription);

setTimeout(() => {
  // subscription 和 childSubscription 都会取消订阅
  subscription.unsubscribe();
}, 1000);
```

执行时，我们在控制台中看到：

```none
second: 0
first: 0
second: 1
first: 1
second: 2
```

Subscriptions 还有一个 `remove(otherSubscription)` 方法，用来撤销一个已添加的子 Subscription 。
