import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { TeardownLogic } from '../Subscription';

import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 发出源 Observable 发出的值，直到 `notifier` Observable 发出值。
 *
 * <span class="informal">让值通过直到第二个 Observable ，
 * 即 `notifier` 发出东西。然后它便完成。</span>
 *
 * <img src="./img/takeUntil.png" width="100%">
 *
 * `takeUntil` 订阅并开始镜像源 Observable 。它还监视另外一个 Observable，即你
 * 提供的 `notifier` 。如果 `notifier` 发出值或 `complete` 通知，那么输出 Observable 
 * 停止镜像源 Observable ，然后完成。
 *
 * @example <caption>每秒都发出值，直到第一次点击发生</caption>
 * var interval = Rx.Observable.interval(1000);
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = interval.takeUntil(clicks);
 * result.subscribe(x => console.log(x));
 *
 * @see {@link take}
 * @see {@link takeLast}
 * @see {@link takeWhile}
 * @see {@link skip}
 *
 * @param {Observable} notifier 该 Observable 第一次发出值会使 `takeUntil` 的
 * 输出 Observable 停止发出由源 Observable 所发出的值。
 * @return {Observable<T>} 该 Observable 发出源 Observable 所发出的值，直到某个
 * 时间点 `notifier` 发出它的第一个值。
 * @method takeUntil
 * @owner Observable
 */
export function takeUntil<T>(this: Observable<T>, notifier: Observable<any>): Observable<T> {
  return this.lift(new TakeUntilOperator(notifier));
}

class TakeUntilOperator<T> implements Operator<T, T> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new TakeUntilSubscriber(subscriber, this.notifier));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class TakeUntilSubscriber<T, R> extends OuterSubscriber<T, R> {

  constructor(destination: Subscriber<any>,
              private notifier: Observable<any>) {
    super(destination);
    this.add(subscribeToResult(this, notifier));
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this.complete();
  }

  notifyComplete(): void {
    // noop
  }
}
