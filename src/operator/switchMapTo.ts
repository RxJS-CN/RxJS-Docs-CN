import { Operator } from '../Operator';
import { Observable, ObservableInput } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/* tslint:disable:max-line-length */
export function switchMapTo<T, R>(this: Observable<T>, observable: ObservableInput<R>): Observable<R>;
export function switchMapTo<T, I, R>(this: Observable<T>, observable: ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 将每个源值投射成同一个 Observable ，该 Observable 会使用 {@link switch} 多次被打平
 * 到输出 Observable 中。
 *
 * <span class="informal">它很像 {@link switchMap}，但永远将每个值映射到同一个内部 
 + * Observable 。</span>
 *
 * <img src="./img/switchMapTo.png" width="100%">
 *
 * 将每个源值映射成给定的 Observable ：`innerObservable` ，而无论源值是什么，然后
 * 将这些结果 Observables 合并到单个的 Observable ，也就是输出 Observable 。
 * 输出 Observables 只会发出 `innerObservable` 实例最新发出的值。
 *
 * @example <caption>每次点击返回一个 interval Observable</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.switchMapTo(Rx.Observable.interval(1000));
 * result.subscribe(x => console.log(x));
 *
 * @see {@link concatMapTo}
 * @see {@link switch}
 * @see {@link switchMap}
 * @see {@link mergeMapTo}
 *
 * @param {ObservableInput} innerObservable 用来替换源 Observable 中的每个值
 * 的 Observable 。
 * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]
 * 函数，它用于产生基于值的输出 Observable 和源(外部)发送和内部 Observable 发送的索引。
 * 传递给这个函数参数有：
 * - `outerValue`: 来自源的值
 * - `innerValue`: 来自投射的 Observable 的值
 * - `outerIndex`: 来自源的值的 "index"
 * - `innerIndex`: 来自投射的 Observable 的值的 "index"
 * @return {Observable} 每次源 Observable 发出值时，该 Observable 发出来自
 * 给定 `innerObservable` (和通过 `resultSelector` 的可选的转换)的项，
 * 并只接收最新投射的内部 Observable 的值。
 * @method switchMapTo
 * @owner Observable
 */
export function switchMapTo<T, I, R>(this: Observable<T>, innerObservable: Observable<I>,
                                     resultSelector?: (outerValue: T,
                                                       innerValue: I,
                                                       outerIndex: number,
                                                       innerIndex: number) => R): Observable<I | R> {
  return this.lift(new SwitchMapToOperator(innerObservable, resultSelector));
}

class SwitchMapToOperator<T, I, R> implements Operator<T, I> {
  constructor(private observable: Observable<I>,
              private resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R) {
  }

  call(subscriber: Subscriber<I>, source: any): any {
    return source.subscribe(new SwitchMapToSubscriber(subscriber, this.observable, this.resultSelector));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SwitchMapToSubscriber<T, I, R> extends OuterSubscriber<T, I> {
  private index: number = 0;
  private innerSubscription: Subscription;

  constructor(destination: Subscriber<I>,
              private inner: Observable<I>,
              private resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R) {
    super(destination);
  }

  protected _next(value: any) {
    const innerSubscription = this.innerSubscription;
    if (innerSubscription) {
      innerSubscription.unsubscribe();
    }
    this.add(this.innerSubscription = subscribeToResult(this, this.inner, value, this.index++));
  }

  protected _complete() {
    const {innerSubscription} = this;
    if (!innerSubscription || innerSubscription.closed) {
      super._complete();
    }
  }

  protected _unsubscribe() {
    this.innerSubscription = null;
  }

  notifyComplete(innerSub: Subscription) {
    this.remove(innerSub);
    this.innerSubscription = null;
    if (this.isStopped) {
      super._complete();
    }
  }

  notifyNext(outerValue: T, innerValue: I,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, I>): void {
    const { resultSelector, destination } = this;
    if (resultSelector) {
      this.tryResultSelector(outerValue, innerValue, outerIndex, innerIndex);
    } else {
      destination.next(innerValue);
    }
  }

  private tryResultSelector(outerValue: T, innerValue: I,
                            outerIndex: number, innerIndex: number): void {
    const { resultSelector, destination } = this;
    let result: R;
    try {
      result = resultSelector(outerValue, innerValue, outerIndex, innerIndex);
    } catch (err) {
      destination.error(err);
      return;
    }

    destination.next(result);
  }
}
