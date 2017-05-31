import { Operator } from '../Operator';
import { Observable, SubscribableOrPromise } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription, TeardownLogic } from '../Subscription';

import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 发出源Observable中由传入的另一个Observable决定的时间段后发出的值.
 *
 * <span class="informal">就像是 {@link debounceTime}, 但是静默时间段由第二个Observable
 * 决定.</span>
 *
 * <img src="./img/debounce.png" width="100%">
 *
 * `debounce` 延时发送源Observable发出的值,但是会丢弃前一个等待的发送如果源
 * Observable发出新的值.这个操作符会追踪源Observable的最新值, 时间段通过调用
 * `durationSelector`确定. 值被发出当持续Observable发出值或者完成, 如果没有
 * 其他数据发送当持续Observable产生. 如果一个新的值出现当持续Observable发出的
 * 时候,前一个数据会被丢弃并且不会被输出Observable发出.
 *
 * 就像{@link debounceTime}, 这是一个控制速率的操作符, 同样也是一个延时类操作符因为输出
 * 并不一定发生在同一时间因为是源Observable上发生的.
 *
 * @example <caption>发出点击后的最近点击</caption>
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
 * 源Observable的值, 对每个值计算持续的时间, 返回一个Observable或者Promise.
 * @return {Observable} Observable，延时源Observable的发送通过`durationSelector`返回
 * 的特定的持续Observable, 同时会丢弃一个值如果发送过于频繁.
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
