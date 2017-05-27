import { async } from '../scheduler/async';
import { Operator } from '../Operator';
import { IScheduler } from '../Scheduler';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subscription, TeardownLogic } from '../Subscription';

/**
 * 忽略一段时间的值,然后从源Observable中发送最新的值,不断重复这个过程.
 *
 * <span class="informal">忽略一段时间内的值, 然后发出最新的值.</span>
 *
 * <img src="./img/auditTime.png" width="100%">
 *
 * `auditTime`和`throttleTime`很像, 但是发送沉默时间窗口的最后一个值, 而不是第一个. 
 * `auditTime` 从源Observable给输出Observable发出最新的值只要时间间隔被禁用, 忽略源
 * Observable的只要时间间隔是启用的. 刚开始, 时间间隔是被禁用的. 只要源Observable发出
 * 第一值, 时间间隔被启用. 度过持续时间后(或者时间单位由内部可选的参数调度器决定),
 * 时间间隔被禁用, 输出Observable发出最新的值, 不断的重复这个过程.
 * 可选的参数{@link IScheduler}管理时间.
 *
 * @example <caption>每1秒之后的点击被发出</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.auditTime(1000);
 * result.subscribe(x => console.log(x));
 *
 * @see {@link audit}
 * @see {@link debounceTime}
 * @see {@link delay}
 * @see {@link sampleTime}
 * @see {@link throttleTime}
 *
 * @param {number} duration 在发出最新值之前的等待时间, 以毫秒或者可选的调度器为时间单位.
 * @param {Scheduler} [scheduler=async] 调度器{@link IScheduler}用来管理rate-limiting
 * 的行为.
 * @return {Observable<T>} 执行源Observable发送rate-limiting的Observable.
 * @method auditTime
 * @owner Observable
 */
export function auditTime<T>(this: Observable<T>, duration: number, scheduler: IScheduler = async): Observable<T> {
  return this.lift(new AuditTimeOperator(duration, scheduler));
}

class AuditTimeOperator<T> implements Operator<T, T> {
  constructor(private duration: number,
              private scheduler: IScheduler) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new AuditTimeSubscriber(subscriber, this.duration, this.scheduler));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class AuditTimeSubscriber<T> extends Subscriber<T> {

  private value: T;
  private hasValue: boolean = false;
  private throttled: Subscription;

  constructor(destination: Subscriber<T>,
              private duration: number,
              private scheduler: IScheduler) {
    super(destination);
  }

  protected _next(value: T): void {
    this.value = value;
    this.hasValue = true;
    if (!this.throttled) {
      this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.duration, this));
    }
  }

  clearThrottle(): void {
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
}

function dispatchNext<T>(subscriber: AuditTimeSubscriber<T>): void {
  subscriber.clearThrottle();
}
