# 编写弹珠测试

“弹珠测试”是使用一种叫做 `TestScheduler` 的专用的虚拟调度器 (VirtualScheduler) 的测试。它们可以使我们以同步且可靠的方式来测试异步操作。“弹珠符号”是源自许多人的教程与文档，例如，@jhusain、@headinthebox、@mattpodwysocki 和 @staltz 。实际上，是由 @staltz 首先提出建议将其作为创建单元测试的 DSL (Domain Specific Language 领域专用语言)，并且它已经经过改造并被采纳。

#### 链接

- [贡献指南](https://github.com/ReactiveX/rxjs/blob/master/CONTRIBUTING.md)
- [行为准则](https://github.com/ReactiveX/rxjs/blob/master/CODE_OF_CONDUCT.md)

## 基础方法

单元测试添加了一些辅助方法，以使创建测试更容易。

- `hot(marbles: string, values?: object, error?: any)` - 创建一个“热的” Observable (Subject)，它将在测试开始时表现得
  好像已经在“运行中”了。一个有趣的不同点是 `hot` 弹珠允许使用`^`字符来标志“零帧”所在处。这正是 Observables 订阅的起始点，
  同时也是测试的起始点。
- `cold(marbles: string, values?: object, error?: any)` - 创建一个“冷的” Observable ，当测试开始时它便开始订阅。
- `expectObservable(actual: Observable<T>).toBe(marbles: string, values?: object, error?: any)` - 当 TestScheduler flush时，   安排一个断言。在 jasmine 的 `it` 块结束处 TestScheduler 会自动进行 flush 。
- `expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]).toBe(subscriptionMarbles: string)` - 
  类似 `expectObservable` ，当 TestScheduler flush时，安排一个断言。`cold()` 和 `hot()` 都返回带有`subscriptions` 属性
  (类型为  `SubscriptionLog[]`)的 Observable 。将 `subscriptions` 作为参数传给 `expectSubscriptions` 以断言是否匹配在 `toBe()` 中
  给定的 `expectObservable` 弹珠图。Subscription 的弹珠图与 Observable 的弹珠图略有不同。详情请参见下面。

### `hot` 和 `cold` 的默认行为是符合人类认知的

在 `hot` 和 `cold` 方法中，弹珠图中指定的值的字符都会作为字符串发出，除非将 `values` 参数传给了方法。因此：

`hot('--a--b')` 会发出 `"a"` 和 `"b"` ，但

`hot('--a--b', { a: 1, b: 2 })` 会发出 `1` 和 `2` 。

同样的，未指明的错误就只发出默认字符串 `"error"`，所以：

`hot('---#')` 会发出错误 `"error"` , 但

`hot('---#', null, new SpecialError('test'))` 会发出 `new SpecialError('test')` 。


## 弹珠语法

弹珠语法是用字符串表示随“时间”流逝而发生的事件。任何弹珠字符串的首字符永远都表示“零帧”。“帧”是有点类似于虚拟毫秒的概念。

- `"-"` 时间: 10“帧”的时间段。
- `"|"` 完成: 表示 Observalbe 成功完成。这是 Observable 生产者所发出的 `complete()` 信号。
- `"#"` 错误: 终止 Observable 的错误。 这是 Observable 生产者所发出的 `error()` 信号。
- `"a"` 任意字符: 所有其他字符表示由 Observalbe 生产者所发出的 `next()` 信号的值。
- `"()"` 同步分组: 当多个事件需要在同一帧中同步地发出，用圆括号来将这些事件聚集在一起。你可以以这种形式来聚合值、完成或错误。
  起始 `(` 的位置决定了值发出的时间。
- `"^"` 订阅时间点: (只适用于热的 Observabe) 显示测试 Observable 订阅热的 Observable 的点。它是此 Observable 的“零帧”，在 `^` 
  前的所有帧都将是无效的。

### 示例

`'-'` 或 `'------'`: 相当于 `Observable.never()`，或一个从不发出值或完成的 Observable 

`|`: 相当于 `Observable.empty()`

`#`: 相当于 `Observable.throw()`

`'--a--'`: 此 Observable 等待20“帧”后发出值 `a` ，然后永远不发出 `complete`

`'--a--b--|`: 在20帧处发出 `a`，在50帧处发出 `b`，然后在80帧处发出 `complete`

`'--a--b--#`: 在20帧处发出 `a`，在50帧处发出 `b`，然后在80帧处发出 `error`

`'-a-^-b--|`: 这是个热的 Observable ，在-20帧处发出 `a`，然后在20帧处发出 `b` ，在50帧出发出 `complete`

`'--(abc)-|'`: 在20帧处发出 `a`、`b` 和 `c`，然后在80帧处发出 `complete` 

`'-----(a|)'`: 在50帧处发出 `a` 和 `complete`

## Subscription 的弹珠语法

Subscription 的弹珠语法与常见的弹珠语法略有不同。它表示随“时间”流逝而发生的**订阅**和**取消订阅**的时间点。在此类图中不应该出现其他类型的事件。

- `"-"` 时间: 10“帧”的时间段。
- `"^"` 订阅时间点: 显示订阅发生的时间点。
- `"!"` 取消订阅时间点: 显示取消订阅发生的时间点。

在 Subscription 的弹珠语法中 `^` 和 `!` 时间点**最多只有一个**。 除此之外，`-` 字符是唯一允许出现的字符。

### 示例

`'-'` 或 `'------'`: 没有订阅发生。

`'--^--'`: 在20帧处发生了订阅，并且订阅没有被取消。

`'--^--!-`: 在20帧处发生了订阅，在50帧处订阅被取消了

## 测试剖析

一个基础的测试看起来应该是下面这样的：

```js

var e1 = hot('----a--^--b-------c--|');
var e2 = hot(  '---d-^--e---------f-----|');
var expected =      '---(be)----c-f-----|';

expectObservable(e1.merge(e2)).toBe(expected);
```

- `hot` observables 的 `^` 字符应该**永远**是对齐的。
- `cold` observables 或预期 observables 的**首字符**和 `hot` observables 的 `^` 应该**永远**彼此对齐的。
- 尽量使用默认的发送值。当必要的时候才指定值 。

使用指定值的测试用例：

```js
var values = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  x: 1 + 3, // a + c
  y: 2 + 4, // b + d
}
var e1 =    hot('---a---b---|', values);
var e2 =    hot('-----c---d---|', values);
var expected =  '-----x---y---|';

expectObservable(e1.zip(e2, function(x, y) { return x + y; }))
  .toBe(expected, values);
```

- 使用同一个散列表来查找所有的值，这可以确保多次使用的同一个字符有着同样的值。
- 将结果值所表示的含义表达的越明显越好，毕竟这些是**测试**，我们最想要的是代码的清晰程度，而不是执行效率，所以 `x: 1 + 3, // a + c` 
  比 `x: 4` 要好。前者传达了**为什么**是4，而后者并没有做到这点。

使用 subscription 断言的测试用例：

```js
var x = cold(        '--a---b---c--|');
var xsubs =    '------^-------!';
var y = cold(                '---d--e---f---|');
var ysubs =    '--------------^-------------!';
var e1 = hot(  '------x-------y------|', { x: x, y: y });
var expected = '--------a---b----d--e---f---|';

expectObservable(e1.switch()).toBe(expected);
expectSubscriptions(x.subscriptions).toBe(xsubs);
expectSubscriptions(y.subscriptions).toBe(ysubs);
```

- 将 `xsubs` 图和 `ysubs` 图的开头与 `expected` 图对齐。
- 注意冷的 observable `x` 取消订阅的同时 `e1` 发出了 `y` 。

在大多数测试中，是没有必要测试订阅时间点和取消订阅时间点的，它们要不就非常明显，要不就在 `expected` 图中有所暗示。在这些情况下是不需要编写 subscription 断言的。在有内部 subscriptions 或冷的 observables 有多个订阅者的测试用例中，这些 subscription 断言还是有用的。

## 基于测试生成 PNG 弹珠图

通常，Jasmine 中的测试用例都是这样写的：`it('should do something', function () { /* ... */ })` 。要想时测试用例可以用来生成 PNG 弹珠图，你必须使用 `asDiagram(label)` 函数，像这样：

<!-- skip-example -->
```js
it.asDiagram(operatorLabel)('should do something', function () {
  // ...
});
```

举例来说，对于 `zip` 操作符，我们可以这样写：

```js
it.asDiagram('zip')('should zip by concatenating', function () {
  var e1 =    hot('---a---b---|');
  var e2 =    hot('-----c---d---|');
  var expected =  '-----x---y---|';
  var values = { x: 'ac', y: 'bd' };

  var result = e1.zip(e2, function(x, y) { return String(x) + String(y); });

  expectObservable(result).toBe(expected, values);
});
```

然后当运行 `npm run tests2png` 时，这个测试用例会解析并且在 `img/` 文件夹下创建一个 PNG 文件 `zip.png` (文件名取决于 `${operatorLabel}.png`)。
