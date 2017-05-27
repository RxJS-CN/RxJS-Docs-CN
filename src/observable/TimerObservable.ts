import { isNumeric } from '../util/isNumeric';
import { IScheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { async } from '../scheduler/async';
import { isScheduler } from '../util/isScheduler';
import { isDate } from '../util/isDate';
import { TeardownLogic } from '../Subscription';
import { Subscriber } from '../Subscriber';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class TimerObservable extends Observable<number> {

  /**
   * 创建一个Observable，该Observable在初始延时之后开始发送并且在每个时间周期后发出自增的数字.
   *
   * <span class="informal">就像是{@link interval}, 但是你可以指定什么时候开始发送.</span>
   *
   * <img src="./img/timer.png" width="100%">
   *
   * `timer` 返回一个发出有限自增数列的Observable, 在一个有你选择的固定时间间隔. 第一个发送发生在
   * 初始延时之后. 初始延时就像是{@link Date}. 默认情况下, 这个操作符使用异步调度器提供时钟概念, 
   * 但是你也可以传递任何调度器. 如果时间周期没有被指定, 输出Observable只发出0. 否则,会发送一个有限数列.
   *
   * @example <caption>发出自增的数字, 每隔1秒, 3秒后开始发送</caption>
   * var numbers = Rx.Observable.timer(3000, 1000);
   * numbers.subscribe(x => console.log(x));
   *
   * @example <caption>5秒后发出一个数字</caption>
   * var numbers = Rx.Observable.timer(5000);
   * numbers.subscribe(x => console.log(x));
   *
   * @see {@link interval}
   * @see {@link delay}
   *
   * @param {number|Date} initialDelay 初始时延.
   * @param {number} [period] 发送数列的时间周期.
   * @param {Scheduler} [scheduler=async] 调度器，调度值的发送, 提供时钟概念.
   * @return {Observable} 初始时延后开始发出0并且每个时间周期发出自增数列的Observable.
   * @static true
   * @name timer
   * @owner Observable
   */
  static create(initialDelay: number | Date = 0,
                period?: number | IScheduler,
                scheduler?: IScheduler): Observable<number> {
    return new TimerObservable(initialDelay, period, scheduler);
  }

  static dispatch(state: any) {

    const { index, period, subscriber } = state;
    const action = (<any> this);

    subscriber.next(index);

    if (subscriber.closed) {
      return;
    } else if (period === -1) {
      return subscriber.complete();
    }

    state.index = index + 1;
    action.schedule(state, period);
  }

  private period: number = -1;
  private dueTime: number = 0;
  private scheduler: IScheduler;

  constructor(dueTime: number | Date = 0,
              period?: number | IScheduler,
              scheduler?: IScheduler) {
    super();

    if (isNumeric(period)) {
      this.period = Number(period) < 1 && 1 || Number(period);
    } else if (isScheduler(period)) {
      scheduler = <IScheduler> period;
    }

    if (!isScheduler(scheduler)) {
      scheduler = async;
    }

    this.scheduler = scheduler;
    this.dueTime = isDate(dueTime) ?
      (+dueTime - this.scheduler.now()) :
      (<number> dueTime);
  }

  protected _subscribe(subscriber: Subscriber<number>): TeardownLogic {
    const index = 0;
    const { period, dueTime, scheduler } = this;

    return scheduler.schedule(TimerObservable.dispatch, dueTime, {
      index, period, subscriber
    });
  }
}
