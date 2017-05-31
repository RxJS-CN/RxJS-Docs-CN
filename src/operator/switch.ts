import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 通过只订阅最新发出的内部 Observable ，将高阶 Observable 转换成一阶 Observable 。
 *
 * <span class="informal">一旦有新的内部 Observable 出现，通过丢弃前一个，将
 * 高级 Observable 打平。</span>
 *
 * <img src="./img/switch.png" width="100%">
 *
 *  `switch` 订阅发出 Observables 的 Observable，也就是高阶 Observable 。
 * 每次观察到这些已发出的内部 Observables 中的其中一个时，输出 Observable 订阅
 * 这个内部 Observable 并开始发出该 Observable 所发出的项。到目前为止，
 * 它的行为就像 {@link mergeAll} 。然而，当发出一个新的内部 Observable 时，
 * `switch` 会从先前发送的内部 Observable 那取消订阅，然后订阅新的内部 Observable 
 * 并开始发出它的值。后续的内部 Observables 也是如此。
 *
 * @example <caption>每次点击返回一个 interval Observable</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * // 每次点击事件都会映射成间隔1秒的 interval Observable
 * var higherOrder = clicks.map((ev) => Rx.Observable.interval(1000));
 * var switched = higherOrder.switch();
 * // 结果是 `switched` 本质上是一个每次点击时会重新启动的计时器。
 * // 之前点击产生的 interval Observables 不会与当前的合并。
 * switched.subscribe(x => console.log(x));
 *
 * @see {@link combineAll}
 * @see {@link concatAll}
 * @see {@link exhaust}
 * @see {@link mergeAll}
 * @see {@link switchMap}
 * @see {@link switchMapTo}
 * @see {@link zipAll}
 *
 * @return {Observable<T>} 该 Observable 发出由源 Observable 最新发出的 
 * Observable 所发出的项。
 * @method switch
 * @name switch
 * @owner Observable
 */
export function _switch<T>(this: Observable<T>): T {
  return <any>this.lift<any>(new SwitchOperator());
}

class SwitchOperator<T, R> implements Operator<T, R> {
  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new SwitchSubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SwitchSubscriber<T, R> extends OuterSubscriber<T, R> {
  private active: number = 0;
  private hasCompleted: boolean = false;
  innerSubscription: Subscription;

  constructor(destination: Subscriber<R>) {
    super(destination);
  }

  protected _next(value: T): void {
    this.unsubscribeInner();
    this.active++;
    this.add(this.innerSubscription = subscribeToResult(this, value));
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (this.active === 0) {
      this.destination.complete();
    }
  }

  private unsubscribeInner(): void {
    this.active = this.active > 0 ? this.active - 1 : 0;
    const innerSubscription = this.innerSubscription;
    if (innerSubscription) {
      innerSubscription.unsubscribe();
      this.remove(innerSubscription);
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this.destination.next(innerValue);
  }

  notifyError(err: any): void {
    this.destination.error(err);
  }

  notifyComplete(): void {
    this.unsubscribeInner();
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  }
}
