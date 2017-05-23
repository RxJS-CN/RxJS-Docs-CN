import { Observable, SubscribableOrPromise } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';

import { subscribeToResult } from '../util/subscribeToResult';
import { OuterSubscriber } from '../OuterSubscriber';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class DeferObservable<T> extends Observable<T> {

  /**
   * 创建一个 Observable，当被订阅的时候，调用 Observable 工厂为每个观察者创建新的 Observable。
   *
   * <span class="informal">惰性创建 Observable, 也就是说, 当且仅当它被订阅的时候才创建。
   * </span>
   *
   * <img src="./img/defer.png" width="100%">
   *
   * `defer`允许你创建一个 Observable 当且仅当它被订阅的时候，并且为每个订阅者创建新的 Observable。
   * 它一直在等待直到观察者订阅了它, 然后它创建一个新的 Observable,通常会以 Observable 工厂函数的方式。
   * 对每个订阅者它都是新的, 所以即使每个订阅者也许会认为它们订阅的是同一个 Observable, 事实上每个订阅
   * 者获得的是只属于它们的 Observable。
   *
   * @example <caption>随机订阅点击或者 interval Observable</caption>
   * var clicksOrInterval = Rx.Observable.defer(function () {
   *   if (Math.random() > 0.5) {
   *     return Rx.Observable.fromEvent(document, 'click');
   *   } else {
   *     return Rx.Observable.interval(1000);
   *   }
   * });
   * clicksOrInterval.subscribe(x => console.log(x));
   *
   * // 结果如下:
   * // 如果Math.random()返回的值大于0.5，它会监听"document"上的点击事件; 当document
   * // 被点击，它会将点击事件对象打印到控制台。 如果结果小于0.5它会每秒发出一个从0开始自增数。
   *
   * @see {@link create}
   *
   * @param {function(): SubscribableOrPromise} observableFactory Observable 的工
   * 厂函数，它会在每个 Observer 订阅 Observable 的时候被触发调用. 也可以返回一个 Promise, Promise 将会立刻被转
   * 化为 Observable。
   * @return {Observable} Observable，该 Observable 的观察者的订阅会触发对 Observable 工厂函数的调用。
   * @static true
   * @name defer
   * @owner Observable
   */
  static create<T>(observableFactory: () => SubscribableOrPromise<T> | void): Observable<T> {
    return new DeferObservable(observableFactory);
  }

  constructor(private observableFactory: () => SubscribableOrPromise<T> | void) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    return new DeferSubscriber(subscriber, this.observableFactory);
  }
}

class DeferSubscriber<T> extends OuterSubscriber<T, T> {
  constructor(destination: Subscriber<T>,
              private factory: () => SubscribableOrPromise<T> | void) {
    super(destination);
    this.tryDefer();
  }

  private tryDefer(): void {
    try {
      this._callFactory();
    } catch (err) {
      this._error(err);
    }
  }

  private _callFactory(): void {
    const result = this.factory();
    if (result) {
      this.add(subscribeToResult(this, result));
    }
  }
}
