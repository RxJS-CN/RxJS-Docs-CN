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
   * 创建一个新的Observable, 该Observable会执行特定的函数当{@link Observer}订阅它的时候.
   *
   * <span class="informal">创建一个定制化的Observable.</span>
   *
   * <img src="./img/create.png" width="100%">
   *
   * `create` 将 `onSubscription` 函数转化为一个真实的Observable.每当有人订阅该Observable的
   * 时候，`onSubscription`函数会接收{@link Observer}实例做为唯一参数执行。`onSubscription` 应该
   * 调用观察者对象的 `next`, `error` and `complete` 方法.
   *
   * 带值调用`next`会将该值发出给观察者.调用`complete`意味着Observable结束了发出，不会做任何事情.
   * 调用`error`意味着出现了错误-传给`error`的参数应该提供详细的错误信息.
   *
   * 一个格式良好的Observable可以通过`next`方法发出尽可能多的值,但是`complete`和`error`方法只能被调用
   * 一次并且之后什么都不能被调用. 如果你试图在Observable已经完成或者发生错误之后调用`next`, `complete` 
   * 或 `error`方法，这些调用将会忽略对所谓的*Observable Contract*保护.注意，你并不需要一定要在某个时刻
   * 调用`complete`方法－创建一个不会被终止的Observable也是很棒的，一切取决于你的需求.
   *
   * `onSubscription`可以选择性的返回一个函数或者一个拥有`unsubscribe`方法的对象. 当要取消对Observable
   * 的订阅时，函数或者方法将会被调用，清理所有的资源.所以，举个例子, 如果你在你自己的Observable里面使用了
   * `setTimeout`, 当有人要取消订阅的时候, 你可以清理定时器, 这样就可以减少不需要的触发和浏览器(或者其他宿主环境)
   * 不会浪费计算资源在这种无谓的事情上.
   *
   * 绝大多数情况下你不需要使用`create`,因为现有的操作符在大多数情况下可以帮助你创建Observable。这也就意味着，
   * `create`是一个底层机制帮助你创建任何Observable，在你有特殊需求的情况下.
   *
   * **TypeScript 签名问题**
   *
   * 因为Observable继承的类已经定义了静态`create`方法,但是签名不同, 不可能给`Observable.create`合适的签名.
   * 正因为如此，给`create`传递的函数将不会进行类型检查，除非你明确指定了特定的签名.
   *
   * 当使用TypeScript，我们建议声明传递给`create`的函数签名为`(observer: Observer) => TeardownLogic`,
   * {@link Observer} 和 {@link TeardownLogic} 是库提供的接口.
   *
   * @example <caption>发出三个数字，然后完成.</caption>
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
   * // Logs
   * // 1
   * // 2
   * // 3
   * // "this is the end"
   *
   *
   * @example <caption>Emit an error</caption>
   * const observable = Rx.Observable.create((observer) => {
   *   observer.error('something went really wrong...');
   * });
   *
   * observable.subscribe(
   *   value => console.log(value), // will never be called
   *   err => console.log(err),
   *   () => console.log('complete') // will never be called
   * );
   *
   * // Logs
   * // "something went really wrong..."
   *
   *
   * @example <caption>Return unsubscribe function</caption>
   *
   * const observable = Rx.Observable.create(observer => {
   *   const id = setTimeout(() => observer.next('...'), 5000); // emit value after 5s
   *
   *   return () => { clearTimeout(id); console.log('cleared!'); };
   * });
   *
   * const subscription = observable.subscribe(value => console.log(value));
   *
   * setTimeout(() => subscription.unsubscribe(), 3000); // cancel subscription after 3s
   *
   * // Logs:
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
   * @param {function(observer: Observer): TeardownLogic} onSubscription A
   * function that accepts an Observer, and invokes its `next`,
   * `error`, and `complete` methods as appropriate, and optionally returns some
   * logic for cleaning up resources.
   * @return {Observable} An Observable that, whenever subscribed, will execute the
   * specified function.
   * @static true
   * @name create
   * @owner Observable
   */
  static create<T>(onSubscription: <R>(observer: Observer<R>) => TeardownLogic): Observable<T> {
    return new Observable<T>(onSubscription);
  };
}

/**
 * An interface for a consumer of push-based notifications delivered by an
 * {@link Observable}.
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
 * An object conforming to the Observer interface is usually
 * given to the `observable.subscribe(observer)` method, and the Observable will
 * call the Observer's `next(value)` method to provide notifications. A
 * well-behaved Observable will call an Observer's `complete()` method exactly
 * once or the Observer's `error(err)` method exactly once, as the last
 * notification delivered.
 *
 * @interface
 * @name Observer
 * @noimport true
 */
export class ObserverDoc<T> {
  /**
   * An optional flag to indicate whether this Observer, when used as a
   * subscriber, has already been unsubscribed from its Observable.
   * @type {boolean}
   */
  closed: boolean = false;
  /**
   * The callback to receive notifications of type `next` from the Observable,
   * with a value. The Observable may call this method 0 or more times.
   * @param {T} value The `next` value.
   * @return {void}
   */
  next(value: T): void {
    return void 0;
  }
  /**
   * The callback to receive notifications of type `error` from the Observable,
   * with an attached {@link Error}. Notifies the Observer that the Observable
   * has experienced an error condition.
   * @param {any} err The `error` exception.
   * @return {void}
   */
  error(err: any): void {
    return void 0;
  }
  /**
   * The callback to receive a valueless notification of type `complete` from
   * the Observable. Notifies the Observer that the Observable has finished
   * sending push-based notifications.
   * @return {void}
   */
  complete(): void {
    return void 0;
  }
}

/**
 * `SubscribableOrPromise` interface describes values that behave like either
 * Observables or Promises. Every operator that accepts arguments annotated
 * with this interface, can be also used with parameters that are not necessarily
 * RxJS Observables.
 *
 * Following types of values might be passed to operators expecting this interface:
 *
 * ## Observable
 *
 * RxJS {@link Observable} instance.
 *
 * ## Observable-like (Subscribable)
 *
 * This might be any object that has `Symbol.observable` method. This method,
 * when called, should return object with `subscribe` method on it, which should
 * behave the same as RxJS `Observable.subscribe`.
 *
 * `Symbol.observable` is part of https://github.com/tc39/proposal-observable proposal.
 * Since currently it is not supported natively, and every symbol is equal only to itself,
 * you should use https://github.com/blesh/symbol-observable polyfill, when implementing
 * custom Observable-likes.
 *
 * **TypeScript Subscribable interface issue**
 *
 * Although TypeScript interface claims that Subscribable is an object that has `subscribe`
 * method declared directly on it, passing custom objects that have `subscribe`
 * method but not `Symbol.observable` method will fail at runtime. Conversely, passing
 * objects with `Symbol.observable` but without `subscribe` will fail at compile time
 * (if you use TypeScript).
 *
 * TypeScript has problem supporting interfaces with methods defined as symbol
 * properties. To get around that, you should implement `subscribe` directly on
 * passed object, and make `Symbol.observable` method simply return `this`. That way
 * everything will work as expected, and compiler will not complain. If you really
 * do not want to put `subscribe` directly on your object, you will have to type cast
 * it to `any`, before passing it to an operator.
 *
 * When this issue is resolved, Subscribable interface will only permit Observable-like
 * objects with `Symbol.observable` defined, no matter if they themselves implement
 * `subscribe` method or not.
 *
 * ## ES6 Promise
 *
 * Promise can be interpreted as Observable that emits value and completes
 * when it is resolved or errors when it is rejected.
 *
 * ## Promise-like (Thenable)
 *
 * Promises passed to operators do not have to be native ES6 Promises.
 * They can be implementations from popular Promise libraries, polyfills
 * or even custom ones. They just need to have `then` method that works
 * as the same as ES6 Promise `then`.
 *
 * @example <caption>Use merge and then map with non-RxJS observable</caption>
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
 * .subscribe(result => console.log(result)); // Logs "This value is 1000"
 *
 *
 * @example <caption>Use combineLatest with ES6 Promise</caption>
 * Rx.Observable.combineLatest(Promise.resolve(5), Promise.resolve(10), Promise.resolve(15))
 * .subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('the end!')
 * );
 * // Logs
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
 * `ObservableInput` interface describes all values that are either an
 * {@link SubscribableOrPromise} or some kind of collection of values that
 * can be transformed to Observable emitting that values. Every operator that
 * accepts arguments annotated with this interface, can be also used with
 * parameters that are not necessarily RxJS Observables.
 *
 * `ObservableInput` extends {@link SubscribableOrPromise} with following types:
 *
 * ## Array
 *
 * Arrays can be interpreted as observables that emit all values in array one by one,
 * from left to right, and then complete immediately.
 *
 * ## Array-like
 *
 * Arrays passed to operators do not have to be built-in JavaScript Arrays. They
 * can be also, for example, `arguments` property available inside every function,
 * [DOM NodeList](https://developer.mozilla.org/pl/docs/Web/API/NodeList),
 * or, actually, any object that has `length` property (which is a number)
 * and stores values under non-negative (zero and up) integers.
 *
 * ## ES6 Iterable
 *
 * Operators will accept both built-in and custom ES6 Iterables, by treating them as
 * observables that emit all its values in order of iteration and then complete
 * when iteration ends. Note that contrary to arrays, Iterables do not have to
 * necessarily be finite, so creating Observables that never complete is possible as well.
 *
 * Note that you can make iterator an instance of Iterable by having it return itself
 * in `Symbol.iterator` method. It means that every operator accepting Iterables accepts,
 * though indirectly, iterators themselves as well. All native ES6 iterators are instances
 * of Iterable by default, so you do not have to implement their `Symbol.iterator` method
 * yourself.
 *
 * **TypeScript Iterable interface issue**
 *
 * TypeScript `ObservableInput` interface actually lacks type signature for Iterables,
 * because of issues it caused in some projects (see [this issue](https://github.com/ReactiveX/rxjs/issues/2306)).
 * If you want to use Iterable as argument for operator, cast it to `any` first.
 * Remember of course that, because of casting, you have to yourself ensure that passed
 * argument really implements said interface.
 *
 *
 * @example <caption>Use merge with arrays</caption>
 * Rx.Observable.merge([1, 2], [4], [5, 6])
 * .subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('ta dam!')
 * );
 *
 * // Logs
 * // 1
 * // 2
 * // 3
 * // 4
 * // 5
 * // 6
 * // "ta dam!"
 *
 *
 * @example <caption>Use merge with array-like</caption>
 * Rx.Observable.merge({0: 1, 1: 2, length: 2}, {0: 3, length: 1})
 * .subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('nice, huh?')
 * );
 *
 * // Logs
 * // 1
 * // 2
 * // 3
 * // "nice, huh?"
 *
 * @example <caption>Use merge with an Iterable (Map)</caption>
 * const firstMap = new Map([[1, 'a'], [2, 'b']]);
 * const secondMap = new Map([[3, 'c'], [4, 'd']]);
 *
 * Rx.Observable.merge(
 *   firstMap,          // pass Iterable
 *   secondMap.values() // pass iterator, which is itself an Iterable
 * ).subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('yup!')
 * );
 *
 * // Logs
 * // [1, "a"]
 * // [2, "b"]
 * // "c"
 * // "d"
 * // "yup!"
 *
 * @example <caption>Use from with generator (returning infinite iterator)</caption>
 * // infinite stream of incrementing numbers
 * const infinite = function* () {
 *   let i = 0;
 *
 *   while (true) {
 *     yield i++;
 *   }
 * };
 *
 * Rx.Observable.from(infinite())
 * .take(3) // only take 3, cause this is infinite
 * .subscribe(
 *   value => console.log(value),
 *   err => {},
 *   () => console.log('ta dam!')
 * );
 *
 * // Logs
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
 * This interface describes what should be returned by function passed to Observable
 * constructor or static {@link create} function. Value of that interface will be used
 * to cancel subscription for given Observable.
 *
 * `TeardownLogic` can be:
 *
 * ## Function
 *
 * Function that takes no parameters. When consumer of created Observable calls `unsubscribe`,
 * that function will be called
 *
 * ## AnonymousSubscription
 *
 * `AnonymousSubscription` is simply an object with `unsubscribe` method on it. That method
 * will work the same as function
 *
 * ## void
 *
 * If created Observable does not have any resources to clean up, function does not have to
 * return anything.
 *
 * @interface
 * @name TeardownLogic
 * @noimport true
 */
export class TeardownLogicDoc {

}
