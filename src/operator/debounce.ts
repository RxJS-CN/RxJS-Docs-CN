import { Operator } from '../Operator';
import { Observable, SubscribableOrPromise } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription, TeardownLogic } from '../Subscription';

import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 只有在另一个 Observable 决定的一段特定时间经过后并且没有发出另一个源值之后，才从源 Observable 中发出一个值。
 *
 * <span class="informal">就像是 {@link debounceTime}, 但是静默时间段由第二个 Observable
 * 决定。</span>
 *
 * <img src="./img/debounce.png" width="100%">
 *
 * `debounce` 延时发送源 Observable 发出的值,但如果源 Observable 发出了新值
 * 的话，它会丢弃掉前一个等待中的延迟发送。这个操作符会追踪源 Observable 的最新值,
 * 并通过调用 durationSelector 函数来生产 duration Observable。只有当 
 * duration Observable 发出值或完成时，才会发出值，如果源 Observable 上没有发
 * 出其他值，那么 duration Observable 就会产生。如果在 duration Observable 发
 * 出前出现了新值，那么前一个值会被丢弃并且不会在输出 Observable 上发出。
 *
 * 就像{@link debounceTime}, 这是一个限制发出频率的操作符, 因为输出发送并不一定是
 * 在同一时间发生的，就像它们在源 Observable 上所做的那样。
 *
 * @example <caption>在一顿狂点后只发出最新的点击</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.debounce(() => Rx.Observable.interval(1000));
 * result.subscribe(x => console.log(x));
 *
 * @see {@link audit}
 * @see {@link debounceTime}
 * @see {@link delayWhen}
 * @see {@link throttle}
 *
 * @param {function(value: T): SubscribableOrPromise} durationSelector 该函数接受
 * 源Observable的值, 用于计算每个值的延迟持续时间, 返回一个Observable或者Promise.
 * @return {Observable} Observable，通过 durationSelector 返回的特定 duration Observable 
 * 来延迟源 Observable 的发送，如果发送过于频繁可能会丢弃一些值。
 * @method debounce
 * @owner Observable
 */
export function debounce<T>(this: Observable<T>, durationSelector: (value: T) => SubscribableOrPromise<number>): Observable<T> {
  return this.lift(new DebounceOperator(durationSelector));
}

class DebounceOperator<T> implements Operator<T, T> {
  constructor(private durationSelector: (value: T) => SubscribableOrPromise<number>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new DebounceSubscriber(subscriber, this.durationSelector));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DebounceSubscriber<T, R> extends OuterSubscriber<T, R> {
  private value: T;
  private hasValue: boolean = false;
  private durationSubscription: Subscription = null;

  constructor(destination: Subscriber<R>,
              private durationSelector: (value: T) => SubscribableOrPromise<number>) {
    super(destination);
  }

  protected _next(value: T): void {
    try {
      const result = this.durationSelector.call(this, value);

      if (result) {
        this._tryNext(value, result);
      }
    } catch (err) {
      this.destination.error(err);
    }
  }

  protected _complete(): void {
    this.emitValue();
    this.destination.complete();
  }

  private _tryNext(value: T, duration: SubscribableOrPromise<number>): void {
    let subscription = this.durationSubscription;
    this.value = value;
    this.hasValue = true;
    if (subscription) {
      subscription.unsubscribe();
      this.remove(subscription);
    }

    subscription = subscribeToResult(this, duration);
    if (!subscription.closed) {
      this.add(this.durationSubscription = subscription);
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this.emitValue();
  }

  notifyComplete(): void {
    this.emitValue();
  }

  emitValue(): void {
    if (this.hasValue) {
      const value = this.value;
      const subscription = this.durationSubscription;
      if (subscription) {
        this.durationSubscription = null;
        subscription.unsubscribe();
        this.remove(subscription);
      }
      this.value = null;
      this.hasValue = false;
      super._next(value);
    }
  }
}
