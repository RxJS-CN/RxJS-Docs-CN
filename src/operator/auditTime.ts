import { async } from '../scheduler/async';
import { Operator } from '../Operator';
import { IScheduler } from '../Scheduler';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subscription, TeardownLogic } from '../Subscription';

/**
 * duration 毫秒内忽略源值，然后发出源 Observable 的最新值， 并且重复此过程。
 *
 * <span class="informal">当它看见一个源值，它会在接下来的 duration 毫秒内忽略这个值以及接下来的源值，过后发出最新的源值。</span>
 *
 * <img src="./img/auditTime.png" width="100%">
 *
 * 
 * `auditTime` 和 `throttleTime` 很像, 但是发送沉默时间窗口的最后一个值, 而不是第一个。只要 audit 的内部时间器被禁用，它就会在
 * 输出 Observable 上发出源 Observable 的最新值，并且当定时器启用时忽略源值。初始时，时间器是禁用的。只要第一个值到达, 时间器被启用。度过
 * 持续时间后(或者时间单位由内部可选的参数调度器决定),时间间隔被禁用, 输出 Observable 发出最新的值, 不断的重复这个过程。可选项 IScheduler 用来管理时间器。
 *
 * @example <caption>以每秒最多点击一次的频率发出点击事件</caption>
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
 * @param {number} duration 以毫秒为单位或以可选的 scheduler 内部决定的时间单位来衡量。
 * @param {Scheduler} [scheduler=async] 调度器( {@link IScheduler} )，用来管理处理限制发送频率的定时器。
 * @return {Observable<T>} 该 Observable 限制源 Observable 的发送频率。
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
