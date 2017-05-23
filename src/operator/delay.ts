import { async } from '../scheduler/async';
import { isDate } from '../util/isDate';
import { Operator } from '../Operator';
import { IScheduler } from '../Scheduler';
import { Subscriber } from '../Subscriber';
import { Action } from '../scheduler/Action';
import { Notification } from '../Notification';
import { Observable } from '../Observable';
import { PartialObserver } from '../Observer';
import { TeardownLogic } from '../Subscription';

/**
 * 通过给定的超时或者直到一个给定的时间来延迟源 Observable 的发送。
 *
 * <span class="informal">每个数据项的发出时间都往后推移固定的毫秒数.</span>
 *
 * <img src="./img/delay.png" width="100%">
 *
 * 如果延时参数是数字, 这个操作符会将源 Observable 的发出时间都往后推移固定的毫秒数。
 * 保存值之间的相对时间间隔.
 *
 * 如果延迟参数是日期类型, 这个操作符会延时Observable的执行直到到了给定的时间.
 *
 * @example <caption>每次点击延迟1秒</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var delayedClicks = clicks.delay(1000); // each click emitted after 1 second
 * delayedClicks.subscribe(x => console.log(x));
 *
 * @example <caption>延时所有的点击直到到达未来的时间点</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var date = new Date('March 15, 2050 12:00:00'); // in the future
 * var delayedClicks = clicks.delay(date); // click emitted only after that date
 * delayedClicks.subscribe(x => console.log(x));
 *
 * @see {@link debounceTime}
 * @see {@link delayWhen}
 *
 * @param {number|Date} delay 延迟时间(以毫秒为单位的数字)或 Date 对象(发送延迟到这个时间点)。
 * @param {Scheduler} [scheduler=async] 调度器，用来管理处理每项时延的定时器。
 * @return {Observable} 该 Observalbe 通过指定的超时时间或日期来延迟源 Observable 的发送。
 * @method delay
 * @owner Observable
 */
export function delay<T>(this: Observable<T>, delay: number|Date,
                         scheduler: IScheduler = async): Observable<T> {
  const absoluteDelay = isDate(delay);
  const delayFor = absoluteDelay ? (+delay - scheduler.now()) : Math.abs(<number>delay);
  return this.lift(new DelayOperator(delayFor, scheduler));
}

class DelayOperator<T> implements Operator<T, T> {
  constructor(private delay: number,
              private scheduler: IScheduler) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new DelaySubscriber(subscriber, this.delay, this.scheduler));
  }
}

interface DelayState<T> {
  source: DelaySubscriber<T>;
  destination: PartialObserver<T>;
  scheduler: IScheduler;
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DelaySubscriber<T> extends Subscriber<T> {
  private queue: Array<DelayMessage<T>> = [];
  private active: boolean = false;
  private errored: boolean = false;

  private static dispatch<T>(this: Action<DelayState<T>>, state: DelayState<T>): void {
    const source = state.source;
    const queue = source.queue;
    const scheduler = state.scheduler;
    const destination = state.destination;

    while (queue.length > 0 && (queue[0].time - scheduler.now()) <= 0) {
      queue.shift().notification.observe(destination);
    }

    if (queue.length > 0) {
      const delay = Math.max(0, queue[0].time - scheduler.now());
      this.schedule(state, delay);
    } else {
      source.active = false;
    }
  }

  constructor(destination: Subscriber<T>,
              private delay: number,
              private scheduler: IScheduler) {
    super(destination);
  }

  private _schedule(scheduler: IScheduler): void {
    this.active = true;
    this.add(scheduler.schedule<DelayState<T>>(DelaySubscriber.dispatch, this.delay, {
      source: this, destination: this.destination, scheduler: scheduler
    }));
  }

  private scheduleNotification(notification: Notification<T>): void {
    if (this.errored === true) {
      return;
    }

    const scheduler = this.scheduler;
    const message = new DelayMessage(scheduler.now() + this.delay, notification);
    this.queue.push(message);

    if (this.active === false) {
      this._schedule(scheduler);
    }
  }

  protected _next(value: T) {
    this.scheduleNotification(Notification.createNext(value));
  }

  protected _error(err: any) {
    this.errored = true;
    this.queue = [];
    this.destination.error(err);
  }

  protected _complete() {
    this.scheduleNotification(Notification.createComplete());
  }
}

class DelayMessage<T> {
  constructor(public readonly time: number,
              public readonly notification: Notification<T>) {
  }
}
