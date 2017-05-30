import { Observable, ObservableInput } from '../Observable';
import { Operator } from '../Operator';
import { PartialObserver } from '../Observer';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/* tslint:disable:max-line-length */
export function mergeMapTo<T, R>(this: Observable<T>, observable: ObservableInput<R>, concurrent?: number): Observable<R>;
export function mergeMapTo<T, I, R>(this: Observable<T>, observable: ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R, concurrent?: number): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 将每个源值投射成同一个 Observable ，该 Observable 会多次合并到输出 Observable 中。
 *
 * <span class="informal">它很像 {@link mergeMap}，但永远将每个值映射到同一个内部 
 * Observable 。</span>
 *
 * <img src="./img/mergeMapTo.png" width="100%">
 *
 * 将每个源值映射成给定的 Observable ：`innerObservable` ，而无论源值是什么，然后
 * 将这些结果 Observables 合并到单个的 Observable ，也就是输出 Observable 。
 *
 * @example <caption>对于每次点击事件，都开启一个时间间隔为1秒的 interval Observable</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.mergeMapTo(Rx.Observable.interval(1000));
 * result.subscribe(x => console.log(x));
 *
 * @see {@link concatMapTo}
 * @see {@link merge}
 * @see {@link mergeAll}
 * @see {@link mergeMap}
 * @see {@link mergeScan}
 * @see {@link switchMapTo}
 *
 * @param {ObservableInput} innerObservable 用来替换源 Observable 中的每个值
 * 的 Observable 。
 * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]
 * * 函数，它用于产生基于值的输出 Observable 和源(外部)发送和内部 Observable 发送的索引。
 + * 传递给这个函数参数有：
 + * - `outerValue`: 来自源的值
 + * - `innerValue`: 来自投射的 Observable 的值
 + * - `outerIndex`: 来自源的值的 "index"
 + * - `innerIndex`: 来自投射的 Observable 的值的 "index"
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] 可以同时订阅的输入 
 * Observables 的最大数量。
 * @return {Observable} 每次源 Observable 发出值时，该 Observable 发出来自
 * 给定 `innerObservable` (和通过 `resultSelector` 的可选的转换)的项。
 * @method mergeMapTo
 * @owner Observable
 */
export function mergeMapTo<T, I, R>(this: Observable<T>, innerObservable: Observable<I>,
                                    resultSelector?: ((outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R) | number,
                                    concurrent: number = Number.POSITIVE_INFINITY): Observable<R> {
  if (typeof resultSelector === 'number') {
    concurrent = <number>resultSelector;
    resultSelector = null;
  }
  return this.lift(new MergeMapToOperator(innerObservable, <any>resultSelector, concurrent));
}

// TODO: Figure out correct signature here: an Operator<Observable<T>, R>
//       needs to implement call(observer: Subscriber<R>): Subscriber<Observable<T>>
export class MergeMapToOperator<T, I, R> implements Operator<Observable<T>, R> {
  constructor(private ish: ObservableInput<I>,
              private resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R,
              private concurrent: number = Number.POSITIVE_INFINITY) {
  }

  call(observer: Subscriber<R>, source: any): any {
    return source.subscribe(new MergeMapToSubscriber(observer, this.ish, this.resultSelector, this.concurrent));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class MergeMapToSubscriber<T, I, R> extends OuterSubscriber<T, I> {
  private hasCompleted: boolean = false;
  private buffer: T[] = [];
  private active: number = 0;
  protected index: number = 0;

  constructor(destination: Subscriber<R>,
              private ish: ObservableInput<I>,
              private resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R,
              private concurrent: number = Number.POSITIVE_INFINITY) {
    super(destination);
  }

  protected _next(value: T): void {
    if (this.active < this.concurrent) {
      const resultSelector = this.resultSelector;
      const index = this.index++;
      const ish = this.ish;
      const destination = this.destination;

      this.active++;
      this._innerSub(ish, destination, resultSelector, value, index);
    } else {
      this.buffer.push(value);
    }
  }

  private _innerSub(ish: ObservableInput<I>,
                    destination: PartialObserver<I>,
                    resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R,
                    value: T,
                    index: number): void {
    this.add(subscribeToResult<T, I>(this, ish, value, index));
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (this.active === 0 && this.buffer.length === 0) {
      this.destination.complete();
    }
  }

  notifyNext(outerValue: T, innerValue: I,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, I>): void {
    const { resultSelector, destination } = this;
    if (resultSelector) {
      this.trySelectResult(outerValue, innerValue, outerIndex, innerIndex);
    } else {
      destination.next(innerValue);
    }
  }

  private trySelectResult(outerValue: T, innerValue: I,
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

  notifyError(err: any): void {
    this.destination.error(err);
  }

  notifyComplete(innerSub: Subscription): void {
    const buffer = this.buffer;
    this.remove(innerSub);
    this.active--;
    if (buffer.length > 0) {
      this._next(buffer.shift());
    } else if (this.active === 0 && this.hasCompleted) {
      this.destination.complete();
    }
  }
}
