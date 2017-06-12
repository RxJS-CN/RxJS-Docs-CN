import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { Subscription, TeardownLogic } from '../Subscription';
import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';

import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 返回一个 Observable， 该 Observable 是源 Observable 不包含错误异常的镜像。 如果源头 Observable 触发 
 * `error`， 这个方法会发出引起错误的 Throwable 给 `notifier` 返回的 Observable。 如果该 Observable 触发 `complete` 或者 `error` 
 * 则该方法会使子订阅触发 `complete` 和 `error`。 否则该方法会重新订阅源 Observable。
 *
 * <img src="./img/retryWhen.png" width="100%">
 *
 * @param {function(errors: Observable): Observable} notifier - 接受一个用户可以`complete` 或者 `error`的通知型 Observable， 终止重试。
 * @return {Observable} 使用重试逻辑修改过的源 Observable。
 * @method retryWhen
 * @owner Observable
 */
export function retryWhen<T>(this: Observable<T>, notifier: (errors: Observable<any>) => Observable<any>): Observable<T> {
  return this.lift(new RetryWhenOperator(notifier, this));
}

class RetryWhenOperator<T> implements Operator<T, T> {
  constructor(protected notifier: (errors: Observable<any>) => Observable<any>,
              protected source: Observable<T>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new RetryWhenSubscriber(subscriber, this.notifier, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class RetryWhenSubscriber<T, R> extends OuterSubscriber<T, R> {

  private errors: Subject<any>;
  private retries: Observable<any>;
  private retriesSubscription: Subscription;

  constructor(destination: Subscriber<R>,
              private notifier: (errors: Observable<any>) => Observable<any>,
              private source: Observable<T>) {
    super(destination);
  }

  error(err: any) {
    if (!this.isStopped) {

      let errors = this.errors;
      let retries: any = this.retries;
      let retriesSubscription = this.retriesSubscription;

      if (!retries) {
        errors = new Subject();
        retries = tryCatch(this.notifier)(errors);
        if (retries === errorObject) {
          return super.error(errorObject.e);
        }
        retriesSubscription = subscribeToResult(this, retries);
      } else {
        this.errors = null;
        this.retriesSubscription = null;
      }

      this._unsubscribeAndRecycle();

      this.errors = errors;
      this.retries = retries;
      this.retriesSubscription = retriesSubscription;

      errors.next(err);
    }
  }

  protected _unsubscribe() {
    const { errors, retriesSubscription } = this;
    if (errors) {
      errors.unsubscribe();
      this.errors = null;
    }
    if (retriesSubscription) {
      retriesSubscription.unsubscribe();
      this.retriesSubscription = null;
    }
    this.retries = null;
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    const { errors, retries, retriesSubscription } = this;
    this.errors = null;
    this.retries = null;
    this.retriesSubscription = null;

    this._unsubscribeAndRecycle();

    this.errors = errors;
    this.retries = retries;
    this.retriesSubscription = retriesSubscription;

    this.source.subscribe(this);
  }
}
