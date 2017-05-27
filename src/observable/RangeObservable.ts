import { IScheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';
import { Subscriber } from '../Subscriber';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class RangeObservable extends Observable<number> {

  /**
   * 创建一个发出特定区间序列数的 Observable.
   *
   * <span class="informal">发出一个区间的序列数.</span>
   *
   * <img src="./img/range.png" width="100%">
   *
   * `range` 操作符顺序发出一个区间的序列数, 你可以决定区间的开始和长度. 默认情况下, 不使用
   * 调度器仅仅同步的发送通知, 但是也可以可选的使用调度器控制发送.
   *
   * @example <caption>发出从1到10的数</caption>
   * var numbers = Rx.Observable.range(1, 10);
   * numbers.subscribe(x => console.log(x));
   *
   * @see {@link timer}
   * @see {@link interval}
   *
   * @param {number} [start=0] 在序列中的第一个值.
   * @param {number} [count=0] 要生成序列的长度.
   * @param {Scheduler} [scheduler] 调度器{@link IScheduler}用来调度通知的发送.
   * @return {Observable} 一个发出有限区间数的Observable.
   * @static true
   * @name range
   * @owner Observable
   */
  static create(start: number = 0,
                count: number = 0,
                scheduler?: IScheduler): Observable<number> {
    return new RangeObservable(start, count, scheduler);
  }

  static dispatch(state: any) {

    const { start, index, count, subscriber } = state;

    if (index >= count) {
      subscriber.complete();
      return;
    }

    subscriber.next(start);

    if (subscriber.closed) {
      return;
    }

    state.index = index + 1;
    state.start = start + 1;

    (<any> this).schedule(state);
  }

  private start: number;
  private _count: number;
  private scheduler: IScheduler;

  constructor(start: number,
              count: number,
              scheduler?: IScheduler) {
    super();
    this.start = start;
    this._count = count;
    this.scheduler = scheduler;
  }

  protected _subscribe(subscriber: Subscriber<number>): TeardownLogic {
    let index = 0;
    let start = this.start;
    const count = this._count;
    const scheduler = this.scheduler;

    if (scheduler) {
      return scheduler.schedule(RangeObservable.dispatch, 0, {
        index, count, start, subscriber
      });
    } else {
      do {
        if (index++ >= count) {
          subscriber.complete();
          break;
        }
        subscriber.next(start++);
        if (subscriber.closed) {
          break;
        }
      } while (true);
    }
  }
}
