# Observer (观察者)

**什么是观察者？** - 观察者是由 Observable 发送的值的消费者。观察者只是一组回调函数的集合，每个回调函数对应一种 Observable 发送的通知类型：`next`、`error` 和 `complete` 。下面的示例是一个典型的观察者对象：

```js
var observer = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
  complete: () => console.log('Observer got a complete notification'),
};
```

要使用观察者，需要把它提供给 Observable 的 `subscribe` 方法：

<!-- skip-example -->
```js
observable.subscribe(observer);
```

<span class="informal">观察者只是有三个回调函数的对象，每个回调函数对应一种 Observable 发送的通知类型。</span>

RxJS 中的观察者也可能是*部分的*。如果你没有提供某个回调函数，Observable 的执行也会正常运行，只是某些通知类型会被忽略，因为观察者中没有相对应的回调函数。

下面的示例是没有 `complete` 回调函数的观察者：

```js
var observer = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
};
```

当订阅 Observable 时，你可能只提供了一个回调函数作为参数，而并没有将其附加到观察者对象上，例如这样：

<!-- skip-example -->
```js
observable.subscribe(x => console.log('Observer got a next value: ' + x));
```

在 `observable.subscribe` 内部，它会创建一个观察者对象并使用第一个回调函数参数作为 `next` 的处理方法。三种类型的回调函数都可以直接作为参数来提供：

<!-- skip-example -->
```js
observable.subscribe(
  x => console.log('Observer got a next value: ' + x),
  err => console.error('Observer got an error: ' + err),
  () => console.log('Observer got a complete notification')
);
```
