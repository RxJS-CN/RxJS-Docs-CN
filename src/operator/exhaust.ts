import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription, TeardownLogic } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 当前一个内部 Observable 还未完成的情况下，通过丢弃内部 Observable 使得
 * 高阶 Observable 转换成一阶 Observable。
 *
 * <span class="informal">在当前内部 Observable 仍在执行的情况下，通过丢弃
 * 内部 Observable 将高阶 Observable 打平。</span>
 *
 * <img src="./img/exhaust.png" width="100%">
 *
 * `exhaust` 订阅发出 Observables 的 Observable，也就是高阶 Observable 。
 * 每次观察到这些已发出的内部 Observables 中的其中一个时，输出 Observable 开始发出该内部 Observable 
 * 要发出的项。到目前为止，它的行为就像 {@link mergeAll} 。然而，如果前一个 Observable 
 * 还未完成的话，`exhaust` 会忽略每个新的内部 Observable 。一旦完成，它将接受并打平下一个
 * 内部 Observable ，然后重复此过程。
 *
 * @example <caption>只要没有当前活动的计时器，那么每次点击就会运行一个有限的计时器。</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var higherOrder = clicks.map((ev) => Rx.Observable.interval(1000).take(5));
 * var result = higherOrder.exhaust();
 * result.subscribe(x => console.log(x));
 *
 * @see {@link combineAll}
 * @see {@link concatAll}
 * @see {@link switch}
 * @see {@link mergeAll}
 * @see {@link exhaustMap}
 * @see {@link zipAll}
 *
 * @return {Observable} Observable 接收源 Observable 并只专注于传播第一个 Observable 直到它完成，然后订阅下一个 Observable 。
 * @method exhaust
 * @owner Observable
 */
export function exhaust<T>(this: Observable<T>): Observable<T> {
  return this.lift(new SwitchFirstOperator<T>());
}

class SwitchFirstOperator<T> implements Operator<T, T> {
  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new SwitchFirstSubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SwitchFirstSubscriber<T> extends OuterSubscriber<T, T> {
  private hasCompleted: boolean = false;
  private hasSubscription: boolean = false;

  constructor(destination: Subscriber<T>) {
    super(destination);
  }

  protected _next(value: T): void {
    if (!this.hasSubscription) {
      this.hasSubscription = true;
      this.add(subscribeToResult(this, value));
    }
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (!this.hasSubscription) {
      this.destination.complete();
    }
  }

  notifyComplete(innerSub: Subscription): void {
    this.remove(innerSub);
    this.hasSubscription = false;
    if (this.hasCompleted) {
      this.destination.complete();
    }
  }
}
