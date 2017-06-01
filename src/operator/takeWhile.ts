import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { TeardownLogic } from '../Subscription';

/**
 * 发出在源 Observable 中满足 `predicate` 函数的每个值，并且一旦出现不满足 `predicate` 
 * 的值就立即完成。
 *
 * <span class="informal">只要当通过给定的条件时才接收源 Observable 的值。
 * 当第一个不满足条件的值出现时，它便完成。</span>
 *
 * <img src="./img/takeWhile.png" width="100%">
 *
 * `takeWhile` 订阅并开始镜像源 Observable 。每个源 Observable 发出的值都会传给 
 * `predicate` 函数，它会返回源值是否满足条件的布尔值。输出 Observable 会发出源值，
 * 直到某个时间点 `predicate` 返回了 false，此时 `takeWhile` 会停止镜像源 Observable 
 * 并且完成输出 Observable 。
 *
 * @example <caption>只有当 clientX 属性大于200时才发出点击事件</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.takeWhile(ev => ev.clientX > 200);
 * result.subscribe(x => console.log(x));
 *
 * @see {@link take}
 * @see {@link takeLast}
 * @see {@link takeUntil}
 * @see {@link skip}
 *
 * @param {function(value: T, index: number): boolean} predicate 评估源 Observable 
 * 所发出值的函数并返回布尔值。还接收 `index`(从0开始) 作为第二个参数。
 * @return {Observable<T>} 只要每个值满足 `predicate` 函数所定义的条件，那么该 
 * Observable 就会从源 Observable 中发出值，然后完成。
 * @method takeWhile
 * @owner Observable
 */
export function takeWhile<T>(this: Observable<T>, predicate: (value: T, index: number) => boolean): Observable<T> {
  return this.lift(new TakeWhileOperator(predicate));
}

class TakeWhileOperator<T> implements Operator<T, T> {
  constructor(private predicate: (value: T, index: number) => boolean) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new TakeWhileSubscriber(subscriber, this.predicate));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class TakeWhileSubscriber<T> extends Subscriber<T> {
  private index: number = 0;

  constructor(destination: Subscriber<T>,
              private predicate: (value: T, index: number) => boolean) {
    super(destination);
  }

  protected _next(value: T): void {
    const destination = this.destination;
    let result: boolean;
    try {
      result = this.predicate(value, this.index++);
    } catch (err) {
      destination.error(err);
      return;
    }
    this.nextOrComplete(value, result);
  }

  private nextOrComplete(value: T, predicateResult: boolean): void {
    const destination = this.destination;
    if (Boolean(predicateResult)) {
      destination.next(value);
    } else {
      destination.complete();
    }
  }
}
