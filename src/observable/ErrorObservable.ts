import { IScheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';
import { Subscriber } from '../Subscriber';

export interface DispatchArg {
  error: any;
  subscriber: any;
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class ErrorObservable extends Observable<any> {

  /**
   * 创建一个给观察者不发送数据并且立马发出错误通知的Observable.
   *
   * <span class="informal">仅仅发出'错误'.
   * </span>
   *
   * <img src="./img/throw.png" width="100%">
   *
   * 这个静态操作符对于创建简单的只发出错误通知的Observable十分有用. 可以被用来和其他
   * Observables组合, 比如说 {@link mergeMap}.
   *
   * @example <caption>先发出数字7，然后发出错误通知.</caption>
   * var result = Rx.Observable.throw(new Error('oops!')).startWith(7);
   * result.subscribe(x => console.log(x), e => console.error(e));
   *
   * @example <caption>把序列数映射成'a', 'b', 'c'序列, 但是当数字为13时发出错误通知</caption>
   * var interval = Rx.Observable.interval(1000);
   * var result = interval.mergeMap(x =>
   *   x === 13 ?
   *     Rx.Observable.throw('Thirteens are bad') :
   *     Rx.Observable.of('a', 'b', 'c')
   * );
   * result.subscribe(x => console.log(x), e => console.error(e));
   *
   * @see {@link create}
   * @see {@link empty}
   * @see {@link never}
   * @see {@link of}
   *
   * @param {any} 传递给错误通知的特定错误对象.
   * @param {Scheduler} [scheduler] 调度器{@link IScheduler}调度错误通知的发送.
   * @return {Observable} 错误Observable: 使用传递的错误对象只发出错误通知.
   * @static true
   * @name throw
   * @owner Observable
   */
  static create(error: any, scheduler?: IScheduler): ErrorObservable {
    return new ErrorObservable(error, scheduler);
  }

  static dispatch(arg: DispatchArg) {
    const { error, subscriber } = arg;
    subscriber.error(error);
  }

  constructor(public error: any, private scheduler?: IScheduler) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<any>): TeardownLogic {
    const error = this.error;
    const scheduler = this.scheduler;

    subscriber.syncErrorThrowable = true;

    if (scheduler) {
      return scheduler.schedule(ErrorObservable.dispatch, 0, {
        error, subscriber
      });
    } else {
      subscriber.error(error);
    }
  }
}
