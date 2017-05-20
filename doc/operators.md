# Operators (操作符)

RxJS 最有用的还是它的**操作符**，尽管它的根基是 Observable 。操作符是允许复杂的异步代码以声明式的方式进行轻松组合的基础代码单元。

## 什么是操作符？

操作符是 Observable 类型上的**方法**，比如 `.map(...)`、`.filter(...)`、`.merge(...)`，等等。当操作符被调用时，它们不会**改变**已经存在的 Observable 实例。相反，它们返回一个**新的** Observable ，它的 subscription 逻辑基于第一个 Observable 。

<span class="informal"> 操作符是函数，它基于当前的 Observable 创建一个新的 Observable。这是一个无副作用的操作：前面的 Observable 保持不变。</span>

操作符本质上是一个纯函数 (pure function)，它接收一个 Observable 作为输入，并生成一个新的 Observable 作为输出。订阅输出的 Observalbe 同样会订阅输入的 Observable 。在下面的示例中，我们创建一个自定义操作符函数，它将从输入的 Observable 接收的每个值都乘以10：

```js
function multiplyByTen(input) {
  var output = Rx.Observable.create(function subscribe(observer) {
    input.subscribe({
      next: (v) => observer.next(10 * v),
      error: (err) => observer.error(err),
      complete: () => observer.complete()
    });
  });
  return output;
}

var input = Rx.Observable.from([1, 2, 3, 4]);
var output = multiplyByTen(input);
output.subscribe(x => console.log(x));
```

输出：

```none
10
20
30
40
```

注意，订阅 `output` 会导致 `input` Observable 也被订阅。我们称之为“操作符订阅链”。

## 实例操作符 vs. 静态操作符

**什么是实例操作符？** - 通常提到操作符时，我们指的是**实例**操作符，它是 Observable 实例上的方法。举例来说，如果上面的 `multiplyByTen` 是官方提供的实例操作符，它看起来大致是这个样子的：

```js
Rx.Observable.prototype.multiplyByTen = function multiplyByTen() {
  var input = this;
  return Rx.Observable.create(function subscribe(observer) {
    input.subscribe({
      next: (v) => observer.next(10 * v),
      error: (err) => observer.error(err),
      complete: () => observer.complete()
    });
  });
}
```

<span class="informal">Instance operators are functions that use the `this` keyword to infer what is the input Observable.</span>

Notice how the `input` Observable is not a function argument anymore, it is assumed to be the `this` object. This is how we would use such instance operator:

```js
var observable = Rx.Observable.from([1, 2, 3, 4]).multiplyByTen();

observable.subscribe(x => console.log(x));
```

**What is a static operator?** Besides instance operators, static operators are functions attached to the Observable class directly. A static operator uses no `this` keyword internally, but instead relies entirely on its arguments.

<span class="informal">Static operators are pure functions attached to the Observable class, and usually are used to create Observables from scratch.</span>

The most common type of static operators are the so-called *Creation Operators*. Instead of transforming an input Observable to an output Observable, they simply take a non-Observable argument, like a number, and *create* a new Observable.

A typical example of a static creation operator would be the `interval` function. It takes a number (not an Observable) as input argument, and produces an Observable as output:

```js
var observable = Rx.Observable.interval(1000 /* number of milliseconds */);
```

Another example of a creation operator is `create`, which we have been using extensively in previous examples. See the list of [all static creation operators here](#creation-operators).

However, static operators may be of different nature than simply creation. Some *Combination Operators* may be static, such as `merge`, `combineLatest`, `concat`, etc. These make sense as static operators because they take *multiple* Observables as input, not just one, for instance:

```js
var observable1 = Rx.Observable.interval(1000);
var observable2 = Rx.Observable.interval(400);

var merged = Rx.Observable.merge(observable1, observable2);
```

## Marble diagrams

To explain how operators work, textual descriptions are often not enough. Many operators are related to time, they may for instance delay, sample, throttle, or debounce value emissions in different ways. Diagrams are often a better tool for that. *Marble Diagrams* are visual representations of how operators work, and include the input Observable(s), the operator and its parameters, and the output Observable.

<span class="informal">In a marble diagram, time flows to the right, and the diagram describes how values ("marbles") are emitted on the Observable execution.</span>

Below you can see the anatomy of a marble diagram.

<img src="./asset/marble-diagram-anatomy.svg">

Throughout this documentation site, we extensively use marble diagrams to explain how operators work. They may be really useful in other contexts too, like on a whiteboard or even in our unit tests (as ASCII diagrams).

## Choose an operator

<div class="decision-tree-widget"></div>

## Categories of operators

There are operators for different purposes, and they may be categorized as: creation, transformation, filtering, combination, multicasting, error handling, utility, etc. In the following list you will find all the operators organized in categories.

### Creation Operators

- `ajax`
- [`bindCallback`](../class/es6/Observable.js~Observable.html#static-method-bindCallback)
- [`bindNodeCallback`](../class/es6/Observable.js~Observable.html#static-method-bindNodeCallback)
- [`create`](../class/es6/Observable.js~Observable.html#static-method-create)
- [`defer`](../class/es6/Observable.js~Observable.html#static-method-defer)
- [`empty`](../class/es6/Observable.js~Observable.html#static-method-empty)
- [`from`](../class/es6/Observable.js~Observable.html#static-method-from)
- [`fromEvent`](../class/es6/Observable.js~Observable.html#static-method-fromEvent)
- [`fromEventPattern`](../class/es6/Observable.js~Observable.html#static-method-fromEventPattern)
- [`fromPromise`](../class/es6/Observable.js~Observable.html#static-method-fromPromise)
- [`generate`](../class/es6/Observable.js~Observable.html#static-method-generate)
- [`interval`](../class/es6/Observable.js~Observable.html#static-method-interval)
- [`never`](../class/es6/Observable.js~Observable.html#static-method-never)
- [`of`](../class/es6/Observable.js~Observable.html#static-method-of)
- [`repeat`](../class/es6/Observable.js~Observable.html#instance-method-repeat)
- [`repeatWhen`](../class/es6/Observable.js~Observable.html#instance-method-repeatWhen)
- [`range`](../class/es6/Observable.js~Observable.html#static-method-range)
- [`throw`](../class/es6/Observable.js~Observable.html#static-method-throw)
- [`timer`](../class/es6/Observable.js~Observable.html#static-method-timer)

### Transformation Operators

- [`buffer`](../class/es6/Observable.js~Observable.html#instance-method-buffer)
- [`bufferCount`](../class/es6/Observable.js~Observable.html#instance-method-bufferCount)
- [`bufferTime`](../class/es6/Observable.js~Observable.html#instance-method-bufferTime)
- [`bufferToggle`](../class/es6/Observable.js~Observable.html#instance-method-bufferToggle)
- [`bufferWhen`](../class/es6/Observable.js~Observable.html#instance-method-bufferWhen)
- [`concatMap`](../class/es6/Observable.js~Observable.html#instance-method-concatMap)
- [`concatMapTo`](../class/es6/Observable.js~Observable.html#instance-method-concatMapTo)
- [`exhaustMap`](../class/es6/Observable.js~Observable.html#instance-method-exhaustMap)
- [`expand`](../class/es6/Observable.js~Observable.html#instance-method-expand)
- [`groupBy`](../class/es6/Observable.js~Observable.html#instance-method-groupBy)
- [`map`](../class/es6/Observable.js~Observable.html#instance-method-map)
- [`mapTo`](../class/es6/Observable.js~Observable.html#instance-method-mapTo)
- [`mergeMap`](../class/es6/Observable.js~Observable.html#instance-method-mergeMap)
- [`mergeMapTo`](../class/es6/Observable.js~Observable.html#instance-method-mergeMapTo)
- [`mergeScan`](../class/es6/Observable.js~Observable.html#instance-method-mergeScan)
- [`pairwise`](../class/es6/Observable.js~Observable.html#instance-method-pairwise)
- [`partition`](../class/es6/Observable.js~Observable.html#instance-method-partition)
- [`pluck`](../class/es6/Observable.js~Observable.html#instance-method-pluck)
- [`scan`](../class/es6/Observable.js~Observable.html#instance-method-scan)
- [`switchMap`](../class/es6/Observable.js~Observable.html#instance-method-switchMap)
- [`switchMapTo`](../class/es6/Observable.js~Observable.html#instance-method-switchMapTo)
- [`window`](../class/es6/Observable.js~Observable.html#instance-method-window)
- [`windowCount`](../class/es6/Observable.js~Observable.html#instance-method-windowCount)
- [`windowTime`](../class/es6/Observable.js~Observable.html#instance-method-windowTime)
- [`windowToggle`](../class/es6/Observable.js~Observable.html#instance-method-windowToggle)
- [`windowWhen`](../class/es6/Observable.js~Observable.html#instance-method-windowWhen)

### Filtering Operators

- [`debounce`](../class/es6/Observable.js~Observable.html#instance-method-debounce)
- [`debounceTime`](../class/es6/Observable.js~Observable.html#instance-method-debounceTime)
- [`distinct`](../class/es6/Observable.js~Observable.html#instance-method-distinct)
- [`distinctKey`](../class/es6/Observable.js~Observable.html#instance-method-distinctKey)
- [`distinctUntilChanged`](../class/es6/Observable.js~Observable.html#instance-method-distinctUntilChanged)
- [`distinctUntilKeyChanged`](../class/es6/Observable.js~Observable.html#instance-method-distinctUntilKeyChanged)
- [`elementAt`](../class/es6/Observable.js~Observable.html#instance-method-elementAt)
- [`filter`](../class/es6/Observable.js~Observable.html#instance-method-filter)
- [`first`](../class/es6/Observable.js~Observable.html#instance-method-first)
- [`ignoreElements`](../class/es6/Observable.js~Observable.html#instance-method-ignoreElements)
- [`audit`](../class/es6/Observable.js~Observable.html#instance-method-audit)
- [`auditTime`](../class/es6/Observable.js~Observable.html#instance-method-auditTime)
- [`last`](../class/es6/Observable.js~Observable.html#instance-method-last)
- [`sample`](../class/es6/Observable.js~Observable.html#instance-method-sample)
- [`sampleTime`](../class/es6/Observable.js~Observable.html#instance-method-sampleTime)
- [`single`](../class/es6/Observable.js~Observable.html#instance-method-single)
- [`skip`](../class/es6/Observable.js~Observable.html#instance-method-skip)
- [`skipLast`](../class/es6/Observable.js~Observable.html#instance-method-skipLast)
- [`skipUntil`](../class/es6/Observable.js~Observable.html#instance-method-skipUntil)
- [`skipWhile`](../class/es6/Observable.js~Observable.html#instance-method-skipWhile)
- [`take`](../class/es6/Observable.js~Observable.html#instance-method-take)
- [`takeLast`](../class/es6/Observable.js~Observable.html#instance-method-takeLast)
- [`takeUntil`](../class/es6/Observable.js~Observable.html#instance-method-takeUntil)
- [`takeWhile`](../class/es6/Observable.js~Observable.html#instance-method-takeWhile)
- [`throttle`](../class/es6/Observable.js~Observable.html#instance-method-throttle)
- [`throttleTime`](../class/es6/Observable.js~Observable.html#instance-method-throttleTime)

### Combination Operators

- [`combineAll`](../class/es6/Observable.js~Observable.html#instance-method-combineAll)
- [`combineLatest`](../class/es6/Observable.js~Observable.html#instance-method-combineLatest)
- [`concat`](../class/es6/Observable.js~Observable.html#instance-method-concat)
- [`concatAll`](../class/es6/Observable.js~Observable.html#instance-method-concatAll)
- [`exhaust`](../class/es6/Observable.js~Observable.html#instance-method-exhaust)
- [`forkJoin`](../class/es6/Observable.js~Observable.html#static-method-forkJoin)
- [`merge`](../class/es6/Observable.js~Observable.html#instance-method-merge)
- [`mergeAll`](../class/es6/Observable.js~Observable.html#instance-method-mergeAll)
- [`race`](../class/es6/Observable.js~Observable.html#instance-method-race)
- [`startWith`](../class/es6/Observable.js~Observable.html#instance-method-startWith)
- [`switch`](../class/es6/Observable.js~Observable.html#instance-method-switch)
- [`withLatestFrom`](../class/es6/Observable.js~Observable.html#instance-method-withLatestFrom)
- [`zip`](../class/es6/Observable.js~Observable.html#static-method-zip)
- [`zipAll`](../class/es6/Observable.js~Observable.html#instance-method-zipAll)

### Multicasting Operators

- [`cache`](../class/es6/Observable.js~Observable.html#instance-method-cache)
- [`multicast`](../class/es6/Observable.js~Observable.html#instance-method-multicast)
- [`publish`](../class/es6/Observable.js~Observable.html#instance-method-publish)
- [`publishBehavior`](../class/es6/Observable.js~Observable.html#instance-method-publishBehavior)
- [`publishLast`](../class/es6/Observable.js~Observable.html#instance-method-publishLast)
- [`publishReplay`](../class/es6/Observable.js~Observable.html#instance-method-publishReplay)
- [`share`](../class/es6/Observable.js~Observable.html#instance-method-share)

### Error Handling Operators

- [`catch`](../class/es6/Observable.js~Observable.html#instance-method-catch)
- [`retry`](../class/es6/Observable.js~Observable.html#instance-method-retry)
- [`retryWhen`](../class/es6/Observable.js~Observable.html#instance-method-retryWhen)

### Utility Operators

- [`do`](../class/es6/Observable.js~Observable.html#instance-method-do)
- [`delay`](../class/es6/Observable.js~Observable.html#instance-method-delay)
- [`delayWhen`](../class/es6/Observable.js~Observable.html#instance-method-delayWhen)
- [`dematerialize`](../class/es6/Observable.js~Observable.html#instance-method-dematerialize)
- `finally`
- `let`
- [`materialize`](../class/es6/Observable.js~Observable.html#instance-method-materialize)
- [`observeOn`](../class/es6/Observable.js~Observable.html#instance-method-observeOn)
- [`subscribeOn`](../class/es6/Observable.js~Observable.html#instance-method-subscribeOn)
- [`timeInterval`](../class/es6/Observable.js~Observable.html#instance-method-timeInterval)
- [`timestamp`](../class/es6/Observable.js~Observable.html#instance-method-timestamp)
- [`timeout`](../class/es6/Observable.js~Observable.html#instance-method-timeout)
- [`timeoutWith`](../class/es6/Observable.js~Observable.html#instance-method-timeoutWith)
- [`toArray`](../class/es6/Observable.js~Observable.html#instance-method-toArray)
- [`toPromise`](../class/es6/Observable.js~Observable.html#instance-method-toPromise)

### Conditional and Boolean Operators

- [`defaultIfEmpty`](../class/es6/Observable.js~Observable.html#instance-method-defaultIfEmpty)
- [`every`](../class/es6/Observable.js~Observable.html#instance-method-every)
- [`find`](../class/es6/Observable.js~Observable.html#instance-method-find)
- [`findIndex`](../class/es6/Observable.js~Observable.html#instance-method-findIndex)
- [`isEmpty`](../class/es6/Observable.js~Observable.html#instance-method-isEmpty)

### Mathematical and Aggregate Operators

- [`count`](../class/es6/Observable.js~Observable.html#instance-method-count)
- [`max`](../class/es6/Observable.js~Observable.html#instance-method-max)
- [`min`](../class/es6/Observable.js~Observable.html#instance-method-min)
- [`reduce`](../class/es6/Observable.js~Observable.html#instance-method-reduce)
