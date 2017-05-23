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
   * 创建一个什么数据都不发出并且立马完成的 Observable。
   *
   * <span class="informal"> 仅仅发出 complete 通知，其他什么也不做。
   * </span>
   *
   * <img src="./img/empty.png" width="100%">
   *
   * 这个静态操作符对于创建一个简单的只发出完成状态通知的 Observable 是非常有用的。 它可以被用来和
   * 其他 Observables 进行组合, 比如在 {@link mergeMap} 中使用。
   *
   * @example <caption>发出数字7, 然后完成。</caption>
   * var result = Rx.Observable.empty().startWith(7);
   * result.subscribe(x => console.log(x));
   *
   * @example <caption>仅将奇数映射并打平成字母序列abc。</caption>
   * var interval = Rx.Observable.interval(1000);
   * var result = interval.mergeMap(x =>
   *   x % 2 === 1 ? Rx.Observable.of('a', 'b', 'c') : Rx.Observable.empty()
   * );
   * result.subscribe(x => console.log(x));
   *
   * // 结果如下:
   * // x 是间隔的计数比如：0,1,2,3,...
   * // x 1000ms 出现一次
   * // 如果 x % 2 等于 1 打印 abc
   * // 如果 x % 2 不等于1 什么也不输出
   *
   * @see {@link create}
   * @see {@link never}
   * @see {@link of}
   * @see {@link throw}
   *
   * @param {Scheduler} [scheduler] 调度器 ( {@link IScheduler} )， 用来调度完成通知。
   * @return {Observable} 空的Observable: 仅仅发出完成通知。
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
