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
   * 创建一个 Observable，该 Observable 在初始延时（`initialDelay`）之后开始发送并且在每个时间周期（ `period`）后发出自增的数字。
   *
   * <span class="informal">就像是{@link interval}, 但是你可以指定什么时候开始发送。</span>
   *
   * <img src="./img/timer.png" width="100%">
   *
   * `timer` 返回一个发出无限自增数列的 Observable, 具有一定的时间间隔，这个间隔由你来选择。 第一个发送发生在
   * 初始延时之后. 初始延时就像是{@link Date}。 默认情况下, 这个操作符使用 async 调度器来提供时间的概念, 
   * 但是你也可以传递任何调度器。 如果时间周期没有被指定, 输出 Observable 只发出0。 否则,会发送一个无限数列。
   *
   * @example <caption>每隔1秒发出自增的数字，3秒后开始发送。</caption>
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
   * @param {number|Date} initialDelay 在发出第一个值 0 之前等待的初始延迟时间。
   * @param {number} [period] 连续数字发送之间的时间周期。
   * @param {Scheduler} [scheduler=async] 调度器，用来调度值的发送, 提供“时间”的概念。
   * @return {Observable} 该 Observable 在初始时延(initialDelay)后发出0，并且在之后的每个时间周期(period)后发出按自增的数字。
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
