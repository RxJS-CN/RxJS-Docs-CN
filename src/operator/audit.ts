import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable, SubscribableOrPromise } from '../Observable';
import { Subscription, TeardownLogic } from '../Subscription';

import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 在由另外一个Observable决定的时间段里忽略源数据，然后发出源Observable最新发出的值，
 * 重复这个过程.
 *
 * <span class="informal">就像是{@link auditTime}, 但是沉默周期由第二个Observable决定.</span>
 *
 * <img src="./img/audit.png" width="100%">
 *
 * `audit`很像`throttle`, 但是发出的是沉默时间窗口的最后一个值, 而不是第一个. `audit`发出源Observable
 * 最新值只要时间间隔结束, 在时间间隔没结束的时候忽略源值.刚开始, 时间间隔是没有启用的. 只要第一个值到达,
 * 通过调用`durationSelector`启用时间间隔, 返回持续Observable. 当持续Observable发出值或者完成状态,
 * 时间间隔被禁用, 然后输出Observable发出数据, 不断持续这个过程.
 *
 * @example <caption>1秒发出一次click</caption>
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
 * @param {function(value: T): SubscribableOrPromise} 持续时间选择器，一个函数接受源Observable
 * 发出的值返回Observable或者Promise计算沉默时间.
 * @return {Observable<T>} 执行源Observable发送rate-limiting的Observable.
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
