import { IScheduler } from '../Scheduler';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';

export interface DispatchArg<T> {
  subscriber: Subscriber<T>;
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class EmptyObservable<T> extends Observable<T> {

  /**
   * 创建一个什么数据都不发出并且立马完成的Observable.
   *
   * <span class="informal">仅仅发出完成.
   * </span>
   *
   * <img src="./img/empty.png" width="100%">
   *
   * 这个静态操作符对于创建一个简单的只发出完成状态通知的Observable是非常有用的. 它可以被用来和
   * 其他Observables进行组合, 就像{@link mergeMap}.
   *
   * @example <caption>发出数字7, 然后完成.</caption>
   * var result = Rx.Observable.empty().startWith(7);
   * result.subscribe(x => console.log(x));
   *
   * @example <caption>Map and flatten only odd numbers to the sequence 'a', 'b', 'c'</caption>
   * var interval = Rx.Observable.interval(1000);
   * var result = interval.mergeMap(x =>
   *   x % 2 === 1 ? Rx.Observable.of('a', 'b', 'c') : Rx.Observable.empty()
   * );
   * result.subscribe(x => console.log(x));
   *
   * // Results in the following to the console:
   * // x is equal to the count on the interval eg(0,1,2,3,...)
   * // x will occur every 1000ms
   * // if x % 2 is equal to 1 print abc
   * // if x % 2 is not equal to 1 nothing will be output
   *
   * @see {@link create}
   * @see {@link never}
   * @see {@link of}
   * @see {@link throw}
   *
   * @param {Scheduler} [scheduler] A {@link IScheduler} to use for scheduling
   * the emission of the complete notification.
   * @return {Observable} An "empty" Observable: emits only the complete
   * notification.
   * @static true
   * @name empty
   * @owner Observable
   */
  static create<T>(scheduler?: IScheduler): Observable<T> {
    return new EmptyObservable<T>(scheduler);
  }

  static dispatch<T>(arg: DispatchArg<T>) {
    const { subscriber } = arg;
    subscriber.complete();
  }

  constructor(private scheduler?: IScheduler) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>): TeardownLogic {

    const scheduler = this.scheduler;

    if (scheduler) {
      return scheduler.schedule(EmptyObservable.dispatch, 0, { subscriber });
    } else {
      subscriber.complete();
    }
  }
}
