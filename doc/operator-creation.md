# 创建操作符

创建 RxJS 的操作符可以有多种方式。在这个版本的 RxJS 中，性能是首要考虑因素，因此，在此库中将创建的操作符依附到现有结构中的这种方式可能不那么直截了当。这是一个尝试性的文档，以告诉你如何创建一个操作符，这个操作符可以是你自己使用，也可以是用来添加到库中。

想了解如何为本库开发一个自定义操作符，[请参见下面](#advanced)。

## 自动动手来为终端用户提供自定义的操作符

### 指南

在大多数情况下，用户可能想要创建一个只在它们的应用中使用的操作符。可以用任何开发者觉得适合的方式来进行开发，但这里有一些指导方针：

1. __操作符应该永远返回一个 Observable __。你正在对一个未知的集合执行操作以创建一个新的集合。只有返回一个新的集合才有意义。如果你创建    了一个返回非 Observable 的方法，那么它就不是一个操作符，好吧。
2. __确保对你的操作符返回的 Observalbe 内部所创建的 subscriptions 进行管理__。你的操作符需要订阅返回 Observable 中的源(或 `this`)，  确保它是作为取消订阅处理方法或 subscription 的一部分返回的。
3. __确保处理传入函数中的异常__。如果你实现的操作符接收函数作为参数，当你调用它时，你会想要将其包裹在 `try/catch` 中并发送
  错误到 observable 的 `error()` 路径。
4. __确保在返回的 Observable 的取消订阅处理方法中释放稀缺资源__。如果你设置了事件处理方法，或 web socket，或一些其他类似的，取消订阅
  方法是移除事件处理方法和关闭 socket 的好地方。

<!-- share-code-between-examples -->
### 示例

<!-- skip-example -->
```js
function mySimpleOperator(someCallback) {
   // 我们可以在这写 `var self = this;` 以保存 `this` ，但看下一条注释
   return Observable.create(subscriber => {
     // 因为我们正在箭头函数中，`this` 来自于外部作用域。
     var source = this;

     // 保存我们的内部 subscription
     var subscription = source.subscribe(value => {
       // 重点：从用户提供的回调函数中捕获错误
       try {
         subscriber.next(someCallback(value));
       } catch(err) {
         subscriber.error(err);
       }
     },
     // 确保处理错误，然后视情况而定进行完成并发送它们
     err => subscriber.error(err),
     () => subscriber.complete());

     // 现在返回
     return subscription;
   });
}
```

### 将操作符添加到 Observalbe 中

有几种方法可以做到这点。至于使用哪种方法取决于需求和偏好：

1) 使用 ES7 函数绑定操作符 (`::`)，在像 [BabelJS](http://babeljs.io) 这样的编译器中是可用的：

<!-- skip-example -->
```js
someObservable::mySimpleOperator(x => x + '!');
```

2) 创建你自己的 Observable 子类并重载 `lift` 方法将其返回：

<!-- skip-example -->
```js
class MyObservable extends Observable {
  lift(operator) {
    const observable = new MyObservable(); //<-- 这里是关键点
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  // 放在这里 .. 或 ..
  customOperator() {
    /* 做些事情并返回 Observable  */
  }
}

// ... 放在这里...
MyObservable.prototype.mySimpleOperator = mySimpleOperator;
```

3) 直接在 `Observable.prototype` 上打补丁：

<!-- skip-example -->
```js
Observable.prototype.mySimpleOperator = mySimpleOperator;

// ... 然后 .../

someObservable.mySimpleOperator(x => x + '!');
```

### 作为纯函数的操作符

如果你不想在 Observable 原型上打补丁的话，还可以编写纯函数作为操作符，此函数接收输入 Observable 作为参数来替代对 `this` 关键字的依赖。

示例实现:

<!-- skip-example -->
```js
function mySimpleOperator(someCallback) {
  // 注意这里返回的是函数
  return function mySimpleOperatorImplementation(source) {
    return Observable.create(subscriber => {
      var subscription = source.subscribe(value => {
        try {
          subscriber.next(someCallback(value));
        } catch(err) {
          subscriber.error(err);
        }
      },
      err => subscriber.error(err),
      () => subscriber.complete());

      return subscription;
   });
  }
}
```

现在可以使用 Observable 上的 `pipe()` 方法:

<!-- skip-example -->
```js
const obs = someObservable.pipe(mySimpleOperator(x => x + '!'));
```

## 将操作符作为独立的库发布

我们强烈推荐你将使用了 `let` 的纯函数的自定义操作符作为独立的 npm 包。RxJS 核心已经超过100个操作符，我们不应该再增加额外的操作符了，除非它们是绝对必要的，并且提供了现有操作符无法提供的功能。

将其作为一个独立的库发布将保证你的操作符能够立即为社区所用，并且这是对 RxJS 社区生态的一种促进与发展，而不是让 RxJS 库变得愈发笨重。但是，在某些情况下，新操作符还是应该添加到核心库中。

## <a id="advanced"></a>创建加入到此库中的操作符

**在提议将操作符加入 RxJS 库之前，请先将其作为独立的库进行发布。** 参见上一节。

__要创建加入到此库中的操作符，最好是基于现有的成果来工作__。像 `filter` 这样的操作符会是不错的开始。没有人会期望你在读完本章后会立即成为一个专家级的操作符贡献者。

**如果你觉得自己很困惑，请不要担心。按照仓库中之前的示例，提交 PR，我们同你并肩作战。**

当你为本库开发操作符时，希望这里所提供的信息能帮你做出决策。当开发操作符时，这里有一些需要知道并(尝试)理解的知识：

1. 实际上所有的操作符方法都是在 `Observable` 之外的单独模块中创建的。这是因为开发者可以通过将操作符方法提取出来并在自己的模块中
  将其方法添加到 observable 中来“构建自己的 observable ”。这也就意味着可以操作符可以单独加入并直接使用，无论是在 Babel 中使用 
  ES7 函数绑定操作符还是通过 `.call()` 来使用。
2. 每个操作符都有一个 `Operator` 类。`Operator` 类实际上是一个 `Subscriber` “工厂”。它会被传递给 `lift` 方法来使“魔法”发生。
  它唯一的工作就是在 subscription 上创建操作符的 `Subscriber` 实例。
3. 每个操作符都有一个 `Subscriber` 类。 这个类完成了操作符的**所有**逻辑。它的工作就是处理接下来的值(通常是通过重载 `_next()` )，
  然后将其转发给 `destination`，即链中的下一个观察者。
   - 重要的是要注意，在任何 `Subscriber` 服务上设置的 `destination` 观察者不仅仅是传递的事件的目的地，如果 `destination` 
     是 `Subscriber` 的话，它也用于设置共享底层的 `Subscription` ，其实际上也是 `Subscriber`，并且是链中的第一个 `Subscriber` 。
   - `Subscribers` 都有 `add` 和 `remove` 方法，用来添加和移除共享底层的 subscription 的内部 subscriptions 。
   - 当你订阅 Observable 时，传递的函数或观察者用于创建链的最终 `destination` `Subscriber` 。它是 `Subscriber` ，实际上也是操作符链的共享 `Subscription` 。

### 为操作符提交 PR

请为每个要添加到 RxJS 的新操作符完成以下步骤，并作为一个 Pull Request：

- 将操作符添加到 Rx 中
- 必须有一个 `-spec.ts` 的测试文件来涵盖典型用例，请使用弹珠图测试
- 如果可以的话，请再编写一个 `asDiagram` 测试用例，用于生成 PNG 弹珠图
- spec 文件应在末尾处有类型定义测试，以验证各种用例的类型定义
- 操作符必须在实现文件中用 JSDoc 风格的文档，同样包括 PNG 弹珠图
- 操作符应该在文件 `doc/operators.md` 中的操作符分类中列举出来
- 还应该在操作符决策树文件 `doc/decision-tree-widget/tree.yml` 中将其加入
- 如果操作符与 RxJS v4 中相对应的有所不同的话，你可能需要更新文件 `MIGRATION.md`

### 内部 Subscriptions

“内部 subscriber” 或“内部 subscription” 是在操作符的主要订阅者中创建的任意 subscription 。例如，如果你要创建一个自己的 “merge” 操作符，在你想要 “合并” 的源 Observable 上接收到的 Observable 需要被订阅。这些 subscriptions 就是内部 subscriptions 。在本库中关于内部 subscriptions 的一个有趣点就是，如果你传递给并设置了 `destination` ，它们会尝试为它们的 `unsubscribe` 调用使用 `destination` 。意味着如果你调用它们的 `unsubscribe`，它可能不会做任何事情。因此，通常不会为内部 subscriptions 设置 `destination` 。一个例子可能就是 `switch` 操作符，它具有单独的底层内部 subscription ，此内部 subscription 取消订阅需要不依赖于主 subscription 。

如果你发现自己创建了内部 subscriptions ，你可能真的需要检查，看看 `_isScalar` 是否传给了 observable ，因为如果是的话，你可以直接将 `value` 提取出来，并当操作标量 observable 时提升操作符性能。作为参考，标量 observable 是具有单一静态值的 observable 。`Observable.of('foo')` 会返回一个 `ScalarObservable`，同样的，resolve 过的 `PromiseObservable 也充当标量。
