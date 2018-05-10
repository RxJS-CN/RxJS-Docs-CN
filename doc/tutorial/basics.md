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

## 控制流动

```js
// 输入 "hello world"
var input = Rx.Observable.fromEvent(document.querySelector('input'), 'input');

// 过滤掉小于3个字符长度的目标值
input.filter(event => event.target.value.length > 2)
  .map(event => event.target.value)
  .subscribe(value => console.log(value)); // "hel"

// 延迟事件
input.delay(200)
  .map(event => event.target.value)
  .subscribe(value => console.log(value)); // "h" -200ms-> "e" -200ms-> "l" ...

// 每200ms只能通过一个事件
input.throttleTime(200)
  .map(event => event.target.value)
  .subscribe(value => console.log(value)); // "h" -200ms-> "w"

// 停止输入后200ms方能通过最新的那个事件
input.debounceTime(200)
  .map(event => event.target.value)
  .subscribe(value => console.log(value)); // "o" -200ms-> "d"

// 在3次事件后停止事件流
input.take(3)
  .map(event => event.target.value)
  .subscribe(value => console.log(value)); // "hel"

// 直到其他 observable 触发事件才停止事件流
var stopStream = Rx.Observable.fromEvent(document.querySelector('button'), 'click');
input.takeUntil(stopStream)
  .map(event => event.target.value)
  .subscribe(value => console.log(value)); // "hello" (点击才能看到)
```

## 产生值

```js
// 输入 "hello world"
var input = Rx.Observable.fromEvent(document.querySelector('input'), 'input');

// 传递一个新的值
input.map(event => event.target.value)
  .subscribe(value => console.log(value)); // "h"

// 通过提取属性传递一个新的值
input.pluck('target', 'value')
  .subscribe(value => console.log(value)); // "h"

// 传递之前的两个值
input.pluck('target', 'value').pairwise()
  .subscribe(value => console.log(value)); // ["h", "he"]

// 只会通过唯一的值
input.pluck('data').distinct()
  .subscribe(value => console.log(value)); // "helo wrd"

// 不会传递重复的值
input.pluck('data').distinctUntilChanged()
  .subscribe(value => console.log(value)); // "helo world"
```
