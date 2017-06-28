import { PartialObserver } from './Observer';
import { Operator } from './Operator';
import { Subscriber } from './Subscriber';
import { Subscription, AnonymousSubscription, TeardownLogic } from './Subscription';
import { root } from './util/root';
import { toSubscriber } from './util/toSubscriber';
import { IfObservable } from './observable/IfObservable';
import { ErrorObservable } from './observable/ErrorObservable';
import { observable as Symbol_observable } from './symbol/observable';

export interface Subscribable<T> {
  subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void),
            error?: (error: any) => void,
            complete?: () => void): AnonymousSubscription;
}

export type SubscribableOrPromise<T> = Subscribable<T> | PromiseLike<T>;
export type ObservableInput<T> = SubscribableOrPromise<T> | ArrayLike<T>;

/**
 * 任意时间内任意一组值的表示。 这是 RxJS 最基本的构建块。
 *
 * @class Observable<T>
 */
export class Observable<T> implements Subscribable<T> {

  public _isScalar: boolean = false;

  protected source: Observable<any>;
  protected operator: Operator<any, T>;

  /**
   * @constructor
   * @param {Function} subscribe 当 Observable 初始订阅的时候会调用该方法. 该函数接受 Subscriber, 这样就可以 `next`
   * 值，或者 `error` 方法会被调用显示错误，或者 `complete` 别调用通知成功的完成。
   */
  constructor(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }

  // HACK: Since TypeScript inherits static properties too, we have to
  // fight against TypeScript here so Subject can have a different static create signature
  /**
   * 创建一个新的冷 Observable，通过调用 Observable 的构造函数。
   * @static true
   * @owner Observable
   * @method create
   * @param {Function} subscribe? subscriber 函数会传递给 Observable 的构造函数。
   * @return {Observable} 新的冷 observable
   */
  static create: Function = <T>(subscribe?: (subscriber: Subscriber<T>) => TeardownLogic) => {
    return new Observable<T>(subscribe);
  }

  /**
   * 创建一个新 Observable，当前 Observable 为源，传递的操作符被定义为新 observable 的操作符。
   * @method lift
   * @param {Operator} operator 定义了 observable 的操作符。
   * @return {Observable} 应用了操作符的新 observable。
   */
  lift<R>(operator: Operator<T, R>): Observable<R> {
    const observable = new Observable<R>();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  subscribe(): Subscription;
  subscribe(observer: PartialObserver<T>): Subscription;
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
  /**
   * 
   * 调用 Observable 和注册 Observer 的处理器以便于发出通知。
   *
   * <span class="informal">当你拥有所有这些 Observables 时使用它，但是仍然什么都没有发生。</span>
   *
   * `subscribe` 不是一个通用操作符，但是是一个调用 Observables 内部 `subscribe` 方法的方法。它也许是一个你传递给 {@link create}
   * 静态工厂的方法，但是大多数情况下它是一个库的实现，它定义了 Observable 什么时候发出，发出什么。这意味着调用 `subscribe` 就是 Observable
   * 开始工作的时刻，而不是人们常想的它创建的时候。
   *
   * 除了开始 Observable 的执行，该方法允许你监听 Observable 发出的值，也包括完成或者发生错误。你可以通过两种方式达到
   * 这种目的。
   *
   * 第一种方式是创建一个实现了 {@link Observer} 接口的对象。它应该实现接口定义的方法，但是注意它仅仅是一个普通的 JavaScript
   * 对象，你可以用任何你想要的方式创建(ES6 class, 常见的构造函数, 对象字面值)。 特别地，不要尝试使用任何 RxJS 的实现细节去创建
   * Observers－你不需要这样做。 同样要记住，你的对象不需要实现所有的方法。如果你发现自己创建一个不做任何事情的方法，你可以简化它。
   * 然而注意，如果 `error` 方法没用被提供，所有的 errors 都不会被捕获。
   *
   * 第二种方式是放弃 Observer 对象 并且简单提供回调函数代替它的方法。这意味你你可以提高3个方法作为参数给 `subscribe`， 第一个回调
   * 等价于 `next` 方法，第二个是 `error` 方法，第三个是 `complete` 方法。就像在 Observer 中情况一样，如果你不需要监听某些，你可以
   * 省略该函数，通过传递 `undefined` 或者 `null`，由于 `subscribe` 在函数调用中的位置识别了这些函数。提到 `error` 函数，正如上文说述，
   * 如果没有提供，Observable 发出的错误会被抛出。
   *
   * 不管你使用了哪种方式调用 `subscribe`，所有情况都返回 Subscription 对象。该对象允许你调用 `unsubscribe`，该方法会停止 Observable 
   * 的工作并且清理 Observable 持有的资源。注意，取消订阅不会掉用 `subscribe` 提供的 `complete` 回调函数，该函数保留了 Observable 定期完成信号。
   *
   * 记住，`subscribe` 提供的回调函数不会保证异步的掉用。是 Observable 自身决定这些方法的执行。例如：{@link of}
   * 默认同步发出所有的值。经常查看文档确定给定 Observable 被订阅的时候会有什么行为，同时你可以改变默认行为通过 {@link Scheduler}。
   *
   * @example <caption>用 Observer 对象订阅</caption>
   * const sumObserver = {
   *   sum: 0,
   *   next(value) {
   *     console.log('Adding: ' + value);
   *     this.sum = this.sum + value;
   *   },
   *   error() { // We actually could just remote this method,
   *   },        // since we do not really care about errors right now.
   *   complete() {
   *     console.log('Sum equals: ' + this.sum);
   *   }
   * };
   *
   * Rx.Observable.of(1, 2, 3) // 同步发出 1， 2， 3 然后完成。
   * .subscribe(sumObserver);
   *
   * // 日志:
   * // "Adding: 1"
   * // "Adding: 2"
   * // "Adding: 3"
   * // "Sum equals: 6"
   *
   *
   * @example <caption>用函数订阅</caption>
   * let sum = 0;
   *
   * Rx.Observable.of(1, 2, 3)
   * .subscribe(
   *   function(value) {
   *     console.log('Adding: ' + value);
   *     sum = sum + value;
   *   },
   *   undefined,
   *   function() {
   *     console.log('Sum equals: ' + sum);
   *   }
   * );
   *
   * // 日志:
   * // "Adding: 1"
   * // "Adding: 2"
   * // "Adding: 3"
   * // "Sum equals: 6"
   *
   *
   * @example <caption>取消订阅</caption>
   * const subscription = Rx.Observable.interval(1000).subscribe(
   *   num => console.log(num),
   *   undefined,
   *   () => console.log('completed!') // 不会被掉用, 即使取消订阅
   * );                                
   *
   *
   * setTimeout(() => {
   *   subscription.unsubscribe();
   *   console.log('unsubscribed!');
   * }, 2500);
   *
   * // Logs:
   * // 0 after 1s
   * // 1 after 2s
   * // "unsubscribed!" after 2,5s
   *
   *
   * @param {Observer|Function} observerOrNext (可选) 或者是 observer 对象, 或者是1个到3个处理器，处理有订阅的 Observable
   * 发出的值。
   * @param {Function} error (可选) 由错误导致的终结事件的处理器。如果没有提供处理器，错误会被抛出。
   * @param {Function} complete (可选) 由成功完成导致的终结事件的处理器。
   * @return {ISubscription} 注册处理程序的订阅引用。
   * @method subscribe
   */
  subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void),
            error?: (error: any) => void,
            complete?: () => void): Subscription {

    const { operator } = this;
    const sink = toSubscriber(observerOrNext, error, complete);

    if (operator) {
      operator.call(sink, this.source);
    } else {
      sink.add(this.source ? this._subscribe(sink) : this._trySubscribe(sink));
    }

    if (sink.syncErrorThrowable) {
      sink.syncErrorThrowable = false;
      if (sink.syncErrorThrown) {
        throw sink.syncErrorValue;
      }
    }

    return sink;
  }

  protected _trySubscribe(sink: Subscriber<T>): TeardownLogic {
    try {
      return this._subscribe(sink);
    } catch (err) {
      sink.syncErrorThrown = true;
      sink.syncErrorValue = err;
      sink.error(err);
    }
  }

  /**
   * @method forEach
   * @param {Function} next  observable 发出的每个值的处理器。
   * @param {PromiseConstructor} [PromiseCtor] 用来生成 Promise 的构造函数。
   * @return {Promise} 一个 observable 完成则 resolves，错误则 rejects 的 promise。
   */
  forEach(next: (value: T) => void, PromiseCtor?: typeof Promise): Promise<void> {
    if (!PromiseCtor) {
      if (root.Rx && root.Rx.config && root.Rx.config.Promise) {
        PromiseCtor = root.Rx.config.Promise;
      } else if (root.Promise) {
        PromiseCtor = root.Promise;
      }
    }

    if (!PromiseCtor) {
      throw new Error('no Promise impl found');
    }

    return new PromiseCtor<void>((resolve, reject) => {
      // Must be declared in a separate statement to avoid a RefernceError when
      // accessing subscription below in the closure due to Temporal Dead Zone.
      let subscription: Subscription;
      subscription = this.subscribe((value) => {
        if (subscription) {
          // if there is a subscription, then we can surmise
          // the next handling is asynchronous. Any errors thrown
          // need to be rejected explicitly and unsubscribe must be
          // called manually
          try {
            next(value);
          } catch (err) {
            reject(err);
            subscription.unsubscribe();
          }
        } else {
          // if there is NO subscription, then we're getting a nexted
          // value synchronously during subscription. We can just call it.
          // If it errors, Observable's `subscribe` will ensure the
          // unsubscription logic is called, then synchronously rethrow the error.
          // After that, Promise will trap the error and send it
          // down the rejection path.
          next(value);
        }
      }, reject, resolve);
    });
  }

  protected _subscribe(subscriber: Subscriber<any>): TeardownLogic {
    return this.source.subscribe(subscriber);
  }

  // `if` and `throw` are special snow flakes, the compiler sees them as reserved words
  static if: typeof IfObservable.create;
  static throw: typeof ErrorObservable.create;

  /**
   * An interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
   * @method Symbol.observable
   * @return {Observable} this instance of the observable
   */
  [Symbol_observable]() {
    return this;
  }
}
