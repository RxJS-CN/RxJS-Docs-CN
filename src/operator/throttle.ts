import { Operator } from '../Operator';
import { Observable, SubscribableOrPromise } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription, TeardownLogic } from '../Subscription';

import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

export interface ThrottleConfig {
  leading?: boolean;
  trailing?: boolean;
}

export const defaultThrottleConfig: ThrottleConfig = {
  leading: true,
  trailing: false
};

/**
 * 从源 Observable 中发出一个值，然后在由另一个 Observable 决定的期间内忽略
 * 随后发出的源值，然后重复此过程。
 *
 * <span class="informal">它很像 {@link throttleTime}，但是沉默持续时间是由
 * 第二个 Observable 决定的。</span>
 *
 * <img src="./img/throttle.png" width="100%">
 *
 * 当 `throttle` 的内部定时器禁用时，它会在输出 Observable 上发出源 Observable 的值，
 * 并当定时器启用时忽略源值。最开始时，定时器是禁用的。一旦第一个源值达到，它会被转发
 * 到输出 Observable ，然后通过使用源值调用 `durationSelector` 函数来启动定时器，这
 * 个函数返回 "duration" Observable 。当 duration Observable 发出值或完成时，定时器
 * 会被禁用，并且下一个源值也是重复此过程。
 *
 * @example <caption>以每秒最多点击一次的频率发出点击事件</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.throttle(ev => Rx.Observable.interval(1000));
 * result.subscribe(x => console.log(x));
 *
 * @see {@link audit}
 * @see {@link debounce}
 * @see {@link delayWhen}
 * @see {@link sample}
 * @see {@link throttleTime}
 *
 * @param {function(value: T): SubscribableOrPromise} durationSelector 该函数
 * 从源 Observable 中接收值，用于为每个源值计算沉默持续时间，并返回 Observable 或 Promise 。
 * @param {Object} config 用来定义 `leading` 和 `trailing` 行为的配置对象。 
 * 默认为 `{ leading: true, trailing: false }` 。
 * @return {Observable<T>} 该 Observable 执行节流操作，以限制源 Observable 的
 * 发送频率。
 * @method throttle
 * @owner Observable
 */
export function throttle<T>(this: Observable<T>,
                            durationSelector: (value: T) => SubscribableOrPromise<number>,
                            config: ThrottleConfig = defaultThrottleConfig): Observable<T> {
  return this.lift(new ThrottleOperator(durationSelector, config.leading, config.trailing));
}

class ThrottleOperator<T> implements Operator<T, T> {
  constructor(private durationSelector: (value: T) => SubscribableOrPromise<number>,
              private leading: boolean,
              private trailing: boolean) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(
      new ThrottleSubscriber(subscriber, this.durationSelector, this.leading, this.trailing)
    );
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc
 * @ignore
 * @extends {Ignored}
 */
class ThrottleSubscriber<T, R> extends OuterSubscriber<T, R> {
  private throttled: Subscription;
  private _trailingValue: T;
  private _hasTrailingValue = false;

  constructor(protected destination: Subscriber<T>,
              private durationSelector: (value: T) => SubscribableOrPromise<number>,
              private _leading: boolean,
              private _trailing: boolean) {
    super(destination);
  }

  protected _next(value: T): void {
    if (this.throttled) {
      if (this._trailing) {
        this._hasTrailingValue = true;
        this._trailingValue = value;
      }
    } else {
      const duration = this.tryDurationSelector(value);
      if (duration) {
        this.add(this.throttled = subscribeToResult(this, duration));
      }
      if (this._leading) {
        this.destination.next(value);
        if (this._trailing) {
          this._hasTrailingValue = true;
          this._trailingValue = value;
        }
      }
    }
  }

  private tryDurationSelector(value: T): SubscribableOrPromise<any> {
    try {
      return this.durationSelector(value);
    } catch (err) {
      this.destination.error(err);
      return null;
    }
  }

  protected _unsubscribe() {
    const { throttled, _trailingValue, _hasTrailingValue, _trailing } = this;

    this._trailingValue = null;
    this._hasTrailingValue = false;

    if (throttled) {
      this.remove(throttled);
      this.throttled = null;
      throttled.unsubscribe();
    }
  }

  private _sendTrailing() {
    const { destination, throttled, _trailing, _trailingValue, _hasTrailingValue } = this;
    if (throttled && _trailing && _hasTrailingValue) {
      destination.next(_trailingValue);
      this._trailingValue = null;
      this._hasTrailingValue = false;
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this._sendTrailing();
    this._unsubscribe();
  }

  notifyComplete(): void {
    this._sendTrailing();
    this._unsubscribe();
  }
}
