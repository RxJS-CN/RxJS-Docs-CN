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
   * 创建一个不发送数据给观察者并且立马发出错误通知的 Observable。
   *
   * <span class="informal">仅仅发出 error 通知，其他什么也不做。</span>
   *
   * <img src="./img/throw.png" width="100%">
   *
   * 这个静态操作符对于创建简单的只发出错误通知的 Observable 十分有用。 可以被用来和其他
   * Observables 组合, 比如在 {@link mergeMap} 中使用。
   *
   * @example <caption>先发出数字7，然后发出错误通知。</caption>
   * var result = Rx.Observable.throw(new Error('oops!')).startWith(7);
   * result.subscribe(x => console.log(x), e => console.error(e));
   *
   * @example <caption>映射并打平成字母序列abc，但当数字为13时抛出错误。</caption>
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
   * @param {any} 将具体的 Error 传递给错误通知。
   * @param {Scheduler} [scheduler] 调度器{@link IScheduler}，用来调度错误通知的发送。
   * @return {Observable} 错误的 Observable：只使用给定的错误参数发出错误通知。
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
