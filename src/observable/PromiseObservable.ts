import { root } from '../util/root';
import { IScheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { TeardownLogic } from '../Subscription';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class PromiseObservable<T> extends Observable<T> {

  public value: T;

  /**
   * 将Promise转化为Observable.
   *
   * <span class="informal">返回一个仅仅发出Promise resolved的值然后完成的Observable.</span>
   *
   * 把ES2015的Promise或者兼容Promises/A+规范的Promise转化为Observable. 如果Promise resolves
   * 一个值, 输出Observable发出这个值然后完成. 如果Promise被rejected, 输出Observable会发出相应的
   * 错误.
   *
   * @example <caption>将Fetch返回的Promise转化为Observable</caption>
   * var result = Rx.Observable.fromPromise(fetch('http://myserver.com/'));
   * result.subscribe(x => console.log(x), e => console.error(e));
   *
   * @see {@link bindCallback}
   * @see {@link from}
   *
   * @param {PromiseLike<T>} promise 被转化的promise.
   * @param {Scheduler} [scheduler] 可选的调度器，用来调度resolved或者rejection的值.
   * @return {Observable<T>} 包装了Promise的Observable.
   * @static true
   * @name fromPromise
   * @owner Observable
   */
  static create<T>(promise: PromiseLike<T>, scheduler?: IScheduler): Observable<T> {
    return new PromiseObservable(promise, scheduler);
  }

  constructor(private promise: PromiseLike<T>, private scheduler?: IScheduler) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>): TeardownLogic {
    const promise = this.promise;
    const scheduler = this.scheduler;

    if (scheduler == null) {
      if (this._isScalar) {
        if (!subscriber.closed) {
          subscriber.next(this.value);
          subscriber.complete();
        }
      } else {
        promise.then(
          (value) => {
            this.value = value;
            this._isScalar = true;
            if (!subscriber.closed) {
              subscriber.next(value);
              subscriber.complete();
            }
          },
          (err) => {
            if (!subscriber.closed) {
              subscriber.error(err);
            }
          }
        )
        .then(null, err => {
          // escape the promise trap, throw unhandled errors
          root.setTimeout(() => { throw err; });
        });
      }
    } else {
      if (this._isScalar) {
        if (!subscriber.closed) {
          return scheduler.schedule(dispatchNext, 0, { value: this.value, subscriber });
        }
      } else {
        promise.then(
          (value) => {
            this.value = value;
            this._isScalar = true;
            if (!subscriber.closed) {
              subscriber.add(scheduler.schedule(dispatchNext, 0, { value, subscriber }));
            }
          },
          (err) => {
            if (!subscriber.closed) {
              subscriber.add(scheduler.schedule(dispatchError, 0, { err, subscriber }));
            }
          })
          .then(null, (err) => {
            // escape the promise trap, throw unhandled errors
            root.setTimeout(() => { throw err; });
          });
      }
    }
  }
}

interface DispatchNextArg<T> {
  subscriber: Subscriber<T>;
  value: T;
}
function dispatchNext<T>(arg: DispatchNextArg<T>) {
  const { value, subscriber } = arg;
  if (!subscriber.closed) {
    subscriber.next(value);
    subscriber.complete();
  }
}

interface DispatchErrorArg<T> {
  subscriber: Subscriber<T>;
  err: any;
}
function dispatchError<T>(arg: DispatchErrorArg<T>) {
  const { err, subscriber } = arg;
  if (!subscriber.closed) {
    subscriber.error(err);
  }
}
