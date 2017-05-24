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
   * 创建一个Observable，当被订阅的时候，调用Observable工厂为每个订阅者创建新的Observable。
   *
   * <span class="informal">懒创建Observable, 也就是说, 当且仅当它被订阅的时候.
   * </span>
   *
   * <img src="./img/defer.png" width="100%">
   * `defer` 允许你创建一个Observable当且仅当它被订阅的时候，并且会每个订阅者创建新的Observable.
   * 它一直在等待直到观察者订阅了它, 然后它创建一个新的Observable,通常会以Observable工厂函数的方式.
   * 对每个订阅者它都是新的, 所以即使每个订阅者也许会认为它们订阅的是同一个Observable, 事实上每个订阅
   * 者获得的只属于它们的Observable.
   *
   * @example <caption>Subscribe to either an Observable of clicks or an Observable of interval, at random</caption>
   * var clicksOrInterval = Rx.Observable.defer(function () {
   *   if (Math.random() > 0.5) {
   *     return Rx.Observable.fromEvent(document, 'click');
   *   } else {
   *     return Rx.Observable.interval(1000);
   *   }
   * });
   * clicksOrInterval.subscribe(x => console.log(x));
   *
   * // Results in the following behavior:
   * // If the result of Math.random() is greater than 0.5 it will listen
   * // for clicks anywhere on the "document"; when document is clicked it
   * // will log a MouseEvent object to the console. If the result is less
   * // than 0.5 it will emit ascending numbers, one every second(1000ms).
   *
   * @see {@link create}
   *
   * @param {function(): SubscribableOrPromise} observableFactory The Observable
   * factory function to invoke for each Observer that subscribes to the output
   * Observable. May also return a Promise, which will be converted on the fly
   * to an Observable.
   * @return {Observable} An Observable whose Observers' subscriptions trigger
   * an invocation of the given Observable factory function.
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
