import { Subscriber } from '../Subscriber';
import { isNumeric } from '../util/isNumeric';
import { IScheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { async } from '../scheduler/async';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class IntervalObservable extends Observable<number> {
  /**
   * 创建一个特定时间间隔发出序列数据的Observable.
   *
   * <span class="informal">定期发出自增的数据.
   * </span>
   *
   * <img src="./img/interval.png" width="100%">
   *
   * `interval` 返回一个发出无限自增的序列数据, 你可以选择固定的时间间隔进行发送. 第一次并
   * 没有立马去发送, 而是第一个时间段过后才发出. 默认情况下, 这个操作符使用异步调度器提供时间
   * 的观念, 你也可以传递任何调度器.
   *
   * @example <caption>每1秒发出一个自增数</caption>
   * var numbers = Rx.Observable.interval(1000);
   * numbers.subscribe(x => console.log(x));
   *
   * @see {@link timer}
   * @see {@link delay}
   *
   * @param {number} [period=0] 时间间隔是以毫米为单位，或者时间单位由调度器时钟决定.
   * @param {Scheduler} [scheduler=async] 调度器用来对发送数据进行调度, 并且提供时间单位.
   * @return {Observable} 在每个时间间隔发出自增数的Observable.
   * @static true
   * @name interval
   * @owner Observable
   */
  static create(period: number = 0,
                scheduler: IScheduler = async): Observable<number> {
    return new IntervalObservable(period, scheduler);
  }

  static dispatch(state: any): void {
    const { index, subscriber, period } = state;

    subscriber.next(index);

    if (subscriber.closed) {
      return;
    }

    state.index += 1;

    (<any> this).schedule(state, period);
  }

  constructor(private period: number = 0,
              private scheduler: IScheduler = async) {
    super();
    if (!isNumeric(period) || period < 0) {
      this.period = 0;
    }
    if (!scheduler || typeof scheduler.schedule !== 'function') {
      this.scheduler = async;
    }
  }

  protected _subscribe(subscriber: Subscriber<number>) {
    const index = 0;
    const period = this.period;
    const scheduler = this.scheduler;

    subscriber.add(scheduler.schedule(IntervalObservable.dispatch, period, {
      index, subscriber, period
    }));
  }
}
