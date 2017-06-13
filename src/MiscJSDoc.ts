/*
 * This file and its definitions are needed just so that ESDoc sees these
 * JSDoc documentation comments. Originally they were meant for some TypeScript
 * interfaces, but TypeScript strips away JSDoc comments near interfaces. Hence,
 * we need these bogus classes, which are not stripped away. This file on the
 * other hand, is not included in the release bundle.
 */
import { TeardownLogic } from './Subscription';
import { Observable } from './Observable';
import './observable/dom/MiscJSDoc';
import { Observer } from './Observer';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class ObservableDoc {
  /**
   * 创建一个新的 Observable ，当观察者( {@link Observer} )订阅该 Observable 时，它会执行指定的函数。
   *
   * <span class="informal">创建自定义的 Observable ，它可以做任何你想做的事情</span>
   *
   * <img src="./img/create.png" width="100%">
   *
   * `create` 将 `onSubscription` 函数转化为一个实际的 Observable 。每当有人订阅该 Observable 的
   * 时候，`onSubscription`函数会接收 {@link Observer} 实例作为唯一参数执行。`onSubscription` 应该
   * 调用观察者对象的 `next`, `error` 和 `complete` 方法。
   *
   * 带值调用 `next` 会将该值发出给观察者。调用 complete 意味着该 Observable 结束了发出并且不会做任何事情了。
   * 调用 `error` 意味着出现了错误，传给 `error` 的参数应该提供详细的错误信息。
   *
   * 一个格式良好的 Observable 可以通过 `next` 方法发出任意多个值，但是 `complete` 和 `error` 方法只能被调用
   * 一次，并且调用之后不会再调用任何方法。 如果你试图在 Observable 已经完成或者发生错误之后调用`next`、 `complete` 
   * 或 `error` 方法，这些调用将会被忽略，以保护所谓的 Observable 合同。注意，你并不需要一定要在某个时刻
   * 调用 `complete` 方法，创建一个不会被终止的 Observable 也是完全可以的，一切取决于你的需求。
   *
   * `onSubscription` 可以选择性的返回一个函数或者一个拥有 `unsubscribe` 方法的对象。 当要取消对 Observable
   * 的订阅时，函数或者方法将会被调用，清理所有的资源。比如说，如果你在自己的 Observable 里面使用了
   * `setTimeout`， 当有人要取消订阅的时候， 你可以清理定时器， 这样就可以减少不必要的触发，并且浏览
   * 器(或者其他宿主环境)也不用将计算能力浪费在这种无人监听的定时事件上。
   *
   * 绝大多数情况下你不需要使用 `create`，因为现有的操作符创建出来的 Observable 能满足绝大多数使用场景。这也就意味着，
   * `create` 是允许你创建任何 Observable 的底层机制，如果你有非常特殊的需求的话，可以使用它。
   *
   * **TypeScript 签名问题**
   *
   * 因为 Observable 继承的类已经定义了静态 `create` 方法,但是签名不同, 不可能给 `Observable.create` 合适的签名。
   * 正因为如此，给 `create` 传递的函数将不会进行类型检查，除非你明确指定了特定的签名。
   *
   * 当使用 TypeScript 时，我们建议将传递给 create 的函数签名声明为`(observer: Observer) => TeardownLogic`,
   * 其中{@link Observer} 和 {@link TeardownLogic} 是库提供的接口。
   *
   * @example <caption>发出三个数字，然后完成。</caption>
   * var observable = Rx.Observable.create(function (observer) {
   *   observer.next(1);
   *   observer.next(2);
   *   observer.next(3);
   *   observer.complete();
   * });
   * observable.subscribe(
   *   value => console.log(value),
   *   err => {},
   *   () => console.log('this is the end')
   * );
   *
   * // 日志:
   * // 1
   * // 2
   * // 3
   * // "this is the end"
   *
   *
   * @example <caption>发出一个错误</caption>
   * const observable = Rx.Observable.create((observer) => {
   *   observer.error('something went really wrong...');
   * });
   *
   * observable.subscribe(
   *   value => console.log(value), // 永远不会被调用
   *   err => console.log(err),
   *   () => console.log('complete') // 永远不会被调用
   * );
   *
   * // 日志:
   * // "something went really wrong..."
   *
   *
   * @example <caption>返回取消订阅函数</caption>
   *
   * const observable = Rx.Observable.create(observer => {
   *   const id = setTimeout(() => observer.next('...'), 5000); // 5s后发出数据
   *
   *   return () => { clearTimeout(id); console.log('cleared!'); };
   * });
   *
   * const subscription = observable.subscribe(value => console.log(value));
   *
   * setTimeout(() => subscription.unsubscribe(), 3000); // 3s后取消订阅
   *
   * // 日志:
   * // "cleared!" after 3s
   *
   * // Never logs "..."
   *
   *
   * @see {@link empty}
   * @see {@link never}
   * @see {@link of}
   * @see {@link throw}
   *
   * @param {function(observer: Observer): TeardownLogic} onSubscription 该函数接受一个观察者，
   * 然后在适当的时机调用观察者的 `next` 、`error` 或者 `complete` 方法，也可以返回一些清理资源的逻辑。
   * @return {Observable} Observable， 当该 Observable 被订阅的时候将会执行特定函数。
   * @static true
   * @name create
   * @owner Observable
   */
  static create<T>(onSubscription: <R>(observer: Observer<R>) => TeardownLogic): Observable<T> {
    return new Observable<T>(onSubscription);
  };
}

/**
 * 消费者接口，消费者接收由 {@link Observable} 推送的通知。
 *
 * ```ts
 * interface Observer<T> {
 *   closed?: boolean;
 *   next: (value: T) => void;
 *   error: (err: any) => void;
 *   complete: () => void;
 * }
 * ```
 *
 * 符合观察者接口规范的对象，通常用来传给 `observable.subscribe(observer)` 方法，同时
 * Observable 会调用观察者的 `next(value)` 提供通知。定义良好的 Observable 会确切的调用
 * 观察者的 `complete()` 或者 `error(err)` 方法一次，作为最后的通知。  
 *
 * @interface
 * @name Observer
 * @noimport true
 */
export class ObserverDoc<T> {
  /**
   * 可选的标志位，用来表示该观察者作为订阅者时，是否已经对它观察的 Observable 取消了订阅。
   * @type {boolean}
   */
  closed: boolean = false;
  /**
   * 该回调函数接收来自 Observable 的 `next` 类型(附带值)的通知。Observable 会调用这个方法0次或者多次。
   * @param {T} value  `next` 的值。
   * @return {void}
   */
  next(value: T): void {
    return void 0;
  }
  /**
   * 该回调函数接收来自 Observable 的 `error` 类型(附带值)的通知，带着 {@link Error} 。通知观察者，
   * Observable 发生了错误。 
   * @param {any} err `error` 异常。
   * @return {void}
   */
  error(err: any): void {
    return void 0;
  }
  /**
   * 该回调函数接收来自于 Observable 的 `complete` 类型(附带值)的通知。通知观察者，Observable 已经
   * 完成了发送推送体系的通知。
   * @return {void}
   */
  complete(): void {
    return void 0;
  }
}

/**
 * `SubscribableOrPromise` 接口描述行为像 Observables 或者 Promises 的值。每个操作符
 * 接受被这个接口注释过的参数，也可以使用不是 RxJS Observables 的参数。 
 *
 * 下列类型的值可以传递给期望此接口的操作符：
 *
 * ## Observable
 *
 * RxJS {@link Observable} 实例。
 *
 * ## 类 Observable 对象 (Subscribable)
 *
 * 这可以是任何拥有 `Symbol.observable` 方法的对象。当这个方法被调用的时候，应该返回一个带有
 * `subscribe` 方法的对象，这个方法的行为应该和 RxJS 的 `Observable.subscribe` 一致。
 *
 * `Symbol.observable` 是 https://github.com/tc39/proposal-observable 提案的一部分。
 * 当实现一个自定义的类 Observable 对象，因为现在还没有被原生支持, 每个符号只和自己相等，你应该使用 https://github.com/blesh/symbol-observable 垫片。
 *
 * **TypeScript Subscribable 接口问题**
 *
 * 尽管 TypeScript 接口声明，可订阅对象是一个声明了 `subscribe` 方法的对象，但是传递定义了 `subscribe` 方法
 * 但是没有定义 `Symbol.observable` 方法的对象在运行时会失败。相反地，传递定义了 `Symbol.observable` 而没有
 * 定义 `subscribe` 的对象将会在编译时失败（如果你使用 TypeScript）。
 *
 * TypeScript 在支持定义了 symbol 属性方法的接口时是有问题的。为了绕过它，你应该直接实现
 * `subscribe` 方法，并且使 `Symbol.observable` 方法简单地返回 `this` 。这种方式能够
 * 起作用，编译器也不会报错。如果你真的不想添加 `subscribe` 方法，你可以在将其传递给操作符之前，
 * 将类型转化为 `any`。
 *
 * 当这个 issue 被解决了，可订阅的接口仅允许定义了 `Symbol.observable` 方法的类 Observable 
 * 对象，无论该对象是否实现了 `subscribe` 方法。   
 *
 * ## ES6 Promise
 *
 * Promise 可以被认为是 Observable，当 resolved 的时候，Observable 发出值并完成，
 * 当 rejected 的时候，Observable 发出错误。
 *
 * ## 类 Promise 对象 (可使用 then 方法的)
 * 
 * 传递给操作符的 Promises 不需要是 ES6 原生的 Promises。可以直接使用流行库或垫片中的实现，甚至自己来实现。
 * 它只需要拥有 `then` 方法，并且该方法和 ES6 Promise 的 `then` 行为
 * 一致。 
 *
 * @example <caption>用非 RxJS 的 observable 作为参数来使用 merge 和 map 操作符</caption>
 * const nonRxJSObservable = {
 *   subscribe(observer) {
 *     observer.next(1000);
 *     observer.complete();
 *   },
 *   [Symbol.observable]() {
 *     return this;
 *   }
 * };
 *
 * Rx.Observable.merge(nonRxJSObservable)
 * .map(value => "This value is " + value)
 * .subscribe(result => console.log(result)); // 输出 "This value is 1000"
 *
 *
 * @example <caption>用 ES6 的 Promise 来使用 combineLatest 操作符</caption>
 * Rx.Observable.combineLatest(Promise.resolve(5), Promise.resolve(10), Promise.resolve(15))
 * .subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('the end!')
 * );
 * // 输出:
 * // [5, 10, 15]
 * // "the end!"
 *
 *
 * @interface
 * @name SubscribableOrPromise
 * @noimport true
 */
export class SubscribableOrPromiseDoc<T> {

}

/**
 * `ObservableInput` 接口描述了所有值是一个 {@link SubscribableOrPromise} 或者
 * 此类型的值可以转化为能发出值的 Observable 。
 * 每个操作符都可以接收被该接口注释过的参数，而不一定需要是 RxJS 的 Observables。
 *
 * `ObservableInput` 继承了 {@link SubscribableOrPromise} ，拥有如下类型:
 *
 * ## 数组
 *
 * 数组可以被理解为，observables 会从左到右，一个接一个地发送数组的所有值，然后立即完成。
 *
 * ## 类数组
 *
 * 传递给操作符的数组也可以不是 JavaScript 内置的数组。它们还可以是其他的，例如，每个函数的 `arguments`
 * 属性，[DOM NodeList](https://developer.mozilla.org/pl/docs/Web/API/NodeList),或者实际上，
 * 拥有 `length` 属性（是个数字）的对象 并且存储了大于0个数。  
 *
 * ## ES6 迭代器
 *
 * 操作符可以接收内置的和自定义的 ES6 迭代器，把它们当做 observables 通过顺序的发出迭代器的所有值，
 * 然后当迭代器完成的时候，触发完成。注意和数组的区别，迭代器不需要是有限的，应该创建一个永远不会完成
 * 的 Observables 使之成为可能。
 *
 * 注意，通过在 `Symbol.iterator` 方法中返回自身，你可以迭代迭代器实例。这意味着每个操作符接收可迭代对象，
 * 但是间接的，迭代器本身也可以。所有原生 ES6 的迭代器默认都是 Iterable 的实例，所以你不需要自己实现 `Symbol.iterator` 方法。
 *
 * **TypeScript Iterable 接口 issue **
 *
 * TypeScript `ObservableInput` 接口实际上缺乏 Iterables 的类型签名，
 * 由于一些项目造成的 issue (查看 [this issue](https://github.com/ReactiveX/rxjs/issues/2306)).
 * 如果你想给操作符传递 Iterable, 首先将它转化为 `any`。当然要铭记，因为类型转化，你需要确保传递的参数
 * 确实实现了此接口。
 *
 *
 * @example <caption>用数组使用 merge 操作符</caption>
 * Rx.Observable.merge([1, 2], [4], [5, 6])
 * .subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('ta dam!')
 * );
 *
 * // 日志：
 * // 1
 * // 2
 * // 3
 * // 4
 * // 5
 * // 6
 * // "ta dam!"
 *
 *
 * @example <caption>用类数组使用 merge 操作符</caption>
 * Rx.Observable.merge({0: 1, 1: 2, length: 2}, {0: 3, length: 1})
 * .subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('nice, huh?')
 * );
 *
 * // 日志：
 * // 1
 * // 2
 * // 3
 * // "nice, huh?"
 *
 * @example <caption>用 Iterable (Map) 使用 merge 操作符</caption>
 * const firstMap = new Map([[1, 'a'], [2, 'b']]);
 * const secondMap = new Map([[3, 'c'], [4, 'd']]);
 *
 * Rx.Observable.merge(
 *   firstMap,          // 传递 Iterable
 *   secondMap.values() // 传递 iterator, 它本身就是 Iterable
 * ).subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('yup!')
 * );
 *
 * // 日志：
 * // [1, "a"]
 * // [2, "b"]
 * // "c"
 * // "d"
 * // "yup!"
 *
 * @example <caption>用 generator（返回无限的 iterator）使用 from 操作符</caption>
 * // 无限的自增数列流
 * const infinite = function* () {
 *   let i = 0;
 *
 *   while (true) {
 *     yield i++;
 *   }
 * };
 *
 * Rx.Observable.from(infinite())
 * .take(3) // 因为是无限的，仅仅取前三个
 * .subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('ta dam!')
 * );
 *
 * // 日志：
 * // 0
 * // 1
 * // 2
 * // "ta dam!"
 *
 * @interface
 * @name ObservableInput
 * @noimport true
 */
export class ObservableInputDoc<T> {

}

/**
 *
 * 这个接口描述了 Observable 构造函数和静态方法 {@link create} 接收的函数的返回对象。这个接口
 * 的值可以用来取消对当前 Observable 的订阅。
 *
 * `TeardownLogic` 可以是:
 *
 * ## 函数
 *
 * 该函数不接收参数。 当创建的 Observable 的消费者调用 `unsubscribe`时，该函数被调用。
 *
 * ## AnonymousSubscription
 *
 * `AnonymousSubscription` 是一个拥有 `unsubscribe` 方法的简单对象。 该方法和上面函数行为一致。
 *
 * ## void
 * 
 * 如果创建的 Observable 不需要清理任何资源，该函数不需要返回任何值。 
 *
 * @interface
 * @name TeardownLogic
 * @noimport true
 */
export class TeardownLogicDoc {

}
