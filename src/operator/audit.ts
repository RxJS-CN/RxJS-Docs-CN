import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable, SubscribableOrPromise } from '../Observable';
import { Subscription, TeardownLogic } from '../Subscription';

import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 在由另外一个 Observable 决定的时间段里忽略源数据，然后发出源 Observable 最新发出的值，
 * 然后重复此过程。
 *
 * <span class="informal">就像是{@link auditTime}, 但是沉默持续时间由第二个 Observable 决定。</span>
 *
 * <img src="./img/audit.png" width="100%">
 *
 * `auditTime`和`throttleTime`很像, 但是发送沉默时间窗口的最后一个值, 而不是第一个。只要 audit 的内部定时间被禁用，它就会在输出 Observable 上发出源 Observable 的最新值，并且当定时器启用时
 * 忽略源值。一旦第一个源值达到，它会被转发到输出 Observable ，然后通过使用源值调用 durationSelector 函数来
 * 启动定时器，这个函数返回 "duration" Observable 。当 duration Observable 发出值或完成时，定时器会被禁用，
 * 并且下一个源值也是重复此过程。
 *
 * @example <caption>以每秒最多点击一次的频率发出点击事件</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.audit(ev => Rx.Observable.interval(1000));
 * result.subscribe(x => console.log(x));
 *
 * @see {@link auditTime}
 * @see {@link debounce}
 * @see {@link delayWhen}
 * @see {@link sample}
 * @see {@link throttle}
 *
 * @param {function(value: T): SubscribableOrPromise} durationSelector 该函数从源 Observable 中接收值，用于为每个源值计算沉默持续时间，并返回 Observable 或 Promise 。
 * @return {Observable<T>} 该 Observable 限制源 Observable 的发送频率。
 * @method audit
 * @owner Observable
 */
export function audit<T>(this: Observable<T>, durationSelector: (value: T) => SubscribableOrPromise<any>): Observable<T> {
  return this.lift(new AuditOperator(durationSelector));
}

class AuditOperator<T> implements Operator<T, T> {
  constructor(private durationSelector: (value: T) => SubscribableOrPromise<any>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new AuditSubscriber<T, T>(subscriber, this.durationSelector));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class AuditSubscriber<T, R> extends OuterSubscriber<T, R> {

  private value: T;
  private hasValue: boolean = false;
  private throttled: Subscription;

  constructor(destination: Subscriber<T>,
              private durationSelector: (value: T) => SubscribableOrPromise<any>) {
    super(destination);
  }

  protected _next(value: T): void {
    this.value = value;
    this.hasValue = true;
    if (!this.throttled) {
      const duration = tryCatch(this.durationSelector)(value);
      if (duration === errorObject) {
        this.destination.error(errorObject.e);
      } else {
        this.add(this.throttled = subscribeToResult(this, duration));
      }
    }
  }

  clearThrottle() {
    const { value, hasValue, throttled } = this;
    if (throttled) {
      this.remove(throttled);
      this.throttled = null;
      throttled.unsubscribe();
    }
    if (hasValue) {
      this.value = null;
      this.hasValue = false;
      this.destination.next(value);
    }
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
    this.clearThrottle();
  }

  notifyComplete(): void {
    this.clearThrottle();
  }
}
