import { Operator } from '../Operator';
import { IScheduler } from '../Scheduler';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';
import { SubscribeOnObservable } from '../observable/SubscribeOnObservable';

/**
 * 使用指定的 IScheduler 异步地订阅此 Observable 的观察者。
 *
 * <img src="./img/subscribeOn.png" width="100%">
 *
 * @param {Scheduler} scheduler - 执行 subscription 操作的 IScheduler 。
 * @return {Observable<T>} 修改过的源 Observable 以便它的 subscriptions 发生在指定的 IScheduler 上。
 .
 * @method subscribeOn
 * @owner Observable
 */
export function subscribeOn<T>(this: Observable<T>, scheduler: IScheduler, delay: number = 0): Observable<T> {
  return this.lift(new SubscribeOnOperator<T>(scheduler, delay));
}

class SubscribeOnOperator<T> implements Operator<T, T> {
  constructor(private scheduler: IScheduler,
              private delay: number) {
  }
  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return new SubscribeOnObservable(
      source, this.delay, this.scheduler
    ).subscribe(subscriber);
  }
}
