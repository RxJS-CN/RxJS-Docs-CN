import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { IScheduler } from '../Scheduler';
import { Action } from '../scheduler/Action';
import { async } from '../scheduler/async';
import { TeardownLogic } from '../Subscription';

/**
 * 在周期时间间隔内发出源 Observable 发出的最新值.
 *
 * <span class="informal">在周期时间间隔内取样源 Observable , 发出取样的.</span>
 *
 * <img src="./img/sampleTime.png" width="100%">
 *
 * `sampleTime` 周期性的查看源 Observable 并且发出上次取样后发出的最新的值, 除非上次取样后
 * 就没有再发出数据了. 取样在每个周期毫秒(或者时间单位由可选的调度器参数决定)内定期发生. 只要
 * 输出 Observable 被订阅取样就开始.
 *
 * @example <caption>每秒, 发出最近的一个点击</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.sampleTime(1000);
 * result.subscribe(x => console.log(x));
 *
 * @see {@link auditTime}
 * @see {@link debounceTime}
 * @see {@link delay}
 * @see {@link sample}
 * @see {@link throttleTime}
 *
 * @param {number} period 用毫秒或者由可选的调度器参数决定的时间单位表示的取样周期.
 * @param {Scheduler} [scheduler=async] {@link IScheduler}用来管理取样的时间.
 * @return {Observable<T>} Observable，该 Observable 发出特定的时间周期从源 Observable 
 * 取样的最新值.
 * @method sampleTime
 * @owner Observable
 */
export function sampleTime<T>(this: Observable<T>, period: number, scheduler: IScheduler = async): Observable<T> {
  return this.lift(new SampleTimeOperator(period, scheduler));
}

class SampleTimeOperator<T> implements Operator<T, T> {
  constructor(private period: number,
              private scheduler: IScheduler) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new SampleTimeSubscriber(subscriber, this.period, this.scheduler));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SampleTimeSubscriber<T> extends Subscriber<T> {
  lastValue: T;
  hasValue: boolean = false;

  constructor(destination: Subscriber<T>,
              private period: number,
              private scheduler: IScheduler) {
    super(destination);
    this.add(scheduler.schedule(dispatchNotification, period, { subscriber: this, period }));
  }

  protected _next(value: T) {
    this.lastValue = value;
    this.hasValue = true;
  }

  notifyNext() {
    if (this.hasValue) {
      this.hasValue = false;
      this.destination.next(this.lastValue);
    }
  }
}

function dispatchNotification<T>(this: Action<any>, state: any) {
  let { subscriber, period } = state;
  subscriber.notifyNext();
  this.schedule(state, period);
}
