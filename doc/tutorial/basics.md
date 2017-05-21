# 基础

## 转换成 observables
<!-- skip-example -->
```js
// 来自一个或多个值
Rx.Observable.of('foo', 'bar');

// 来自数组
Rx.Observable.from([1,2,3]);

// 来自事件
Rx.Observable.fromEvent(document.querySelector('button'), 'click');

// 来自 Promise
Rx.Observable.fromPromise(fetch('/users'));

// 来自回调函数(最后一个参数得是回调函数，比如下面的 cb)
// fs.exists = (path, cb(exists))
var exists = Rx.Observable.bindCallback(fs.exists);
exists('file.txt').subscribe(exists => console.log('Does file exist?', exists));

// 来自回调函数(最后一个参数得是回调函数，比如下面的 cb)
// fs.rename = (pathA, pathB, cb(err, result))
var rename = Rx.Observable.bindNodeCallback(fs.rename);
rename('file.txt', 'else.txt').subscribe(() => console.log('Renamed!'));
```

## 创建 observables

在外部产生新事件。

```js
var myObservable = new Rx.Subject();
myObservable.subscribe(value => console.log(value));
myObservable.next('foo');
```

在内部产生新事件。

```js
var myObservable = Rx.Observable.create(observer => {
  observer.next('foo');
  setTimeout(() => observer.next('bar'), 1000);
});
myObservable.subscribe(value => console.log(value));
```

选择哪种方式需要根据场景。当你想要包装随时间推移产生值的功能时，普通的 **Observable** 就已经很好了。使用 **Subject**，你可以从任何地方触发新事件，并且将已存在的 observables 和它进行连接。

## Controlling the flow

```js
// typing "hello world"
var input = Rx.Observable.fromEvent(document.querySelector('input'), 'input');

// Filter out target values less than 3 characters long
input.filter(event => event.target.value.length > 2)
  .map(event => event.target.value)
  .subscribe(value => console.log(value)); // "hel"

// Delay the events
input.delay(200)
  .map(event => event.target.value)
  .subscribe(value => console.log(value)); // "h" -200ms-> "e" -200ms-> "l" ...

// Only let through an event every 200 ms
input.throttleTime(200)
  .map(event => event.target.value)
  .subscribe(value => console.log(value)); // "h" -200ms-> "w"

// Let through latest event after 200 ms
input.debounceTime(200)
  .map(event => event.target.value)
  .subscribe(value => console.log(value)); // "o" -200ms-> "d"

// Stop the stream of events after 3 events
input.take(3)
  .map(event => event.target.value)
  .subscribe(value => console.log(value)); // "hel"

// Passes through events until other observable triggers an event
var stopStream = Rx.Observable.fromEvent(document.querySelector('button'), 'click');
input.takeUntil(stopStream)
  .map(event => event.target.value)
  .subscribe(value => console.log(value)); // "hello" (click)
```

## Producing values
```js
// typing "hello world"
var input = Rx.Observable.fromEvent(document.querySelector('input'), 'input');

// Pass on a new value
input.map(event => event.target.value)
  .subscribe(value => console.log(value)); // "h"

// Pass on a new value by plucking it
input.pluck('target', 'value')
  .subscribe(value => console.log(value)); // "h"

// Pass the two previous values
input.pluck('target', 'value').pairwise()
  .subscribe(value => console.log(value)); // ["h", "e"]

// Only pass unique values through
input.pluck('target', 'value').distinct()
  .subscribe(value => console.log(value)); // "helo wrd"

// Do not pass repeating values through
input.pluck('target', 'value').distinctUntilChanged()
  .subscribe(value => console.log(value)); // "helo world"
```
