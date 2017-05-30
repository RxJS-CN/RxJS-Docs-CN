import { Observable, ObservableInput } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { subscribeToResult } from '../util/subscribeToResult';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';

/* tslint:disable:max-line-length */
export function mergeMap<T, R>(this: Observable<T>, project: (value: T, index: number) => ObservableInput<R>, concurrent?: number): Observable<R>;
export function mergeMap<T, I, R>(this: Observable<T>, project: (value: T, index: number) => ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R, concurrent?: number): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 将每个源值投射成 Observable ，该 Observable 会合并到输出 Observable 中。
 *
 * <span class="informal">将每个值映射成 Observable ，然后使用 {@link mergeAll} 
 * 打平所有的内部 Observables 。</span>
 *
 * <img src="./img/mergeMap.png" width="100%">
 *
 * 返回的 Observable 基于应用一个函数来发送项，该函数提供给源 Observable 发出的每个项，
 * 并返回一个 Observable，然后合并这些作为结果的 Observable，并发出本次合并的结果。
 *
 * @example <caption>将每个字母映射并打平成一个 Observable ，每1秒钟一次</caption>
 * var letters = Rx.Observable.of('a', 'b', 'c');
 * var result = letters.mergeMap(x =>
 *   Rx.Observable.interval(1000).map(i => x+i)
 * );
 * result.subscribe(x => console.log(x));
 *
 * // 结果如下：
 * // a0
 * // b0
 * // c0
 * // a1
 * // b1
 * // c1
 * // 继续列出a、b、c加上各自的上升整数
 *
 * @see {@link concatMap}
 * @see {@link exhaustMap}
 * @see {@link merge}
 * @see {@link mergeAll}
 * @see {@link mergeMapTo}
 * @see {@link mergeScan}
 * @see {@link switchMap}
 *
 * @param {function(value: T, ?index: number): ObservableInput} project 函数，
 + * 当应用于源 Observable 发出的项时，返回一个 Observable 。
 * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]
 * * 函数，它用于产生基于值的输出 Observable 和源(外部)发送和内部 Observable 发送的索引。
 + * 传递给这个函数参数有：
 + * - `outerValue`: 来自源的值
 + * - `innerValue`: 来自投射的 Observable 的值
 + * - `outerIndex`: 来自源的值的 "index"
 + * - `innerIndex`: 来自投射的 Observable 的值的 "index"
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] 可以同时订阅的输入 
 * Observables 的最大数量。
 * @return {Observable} 该 Observable 发出由源 Observable 发出的每项应用投射函数
 * (和可选的 `resultSelector`)后的结果，并合并从该转化获得的 Observables 的结果。
 * @method mergeMap
 * @owner Observable
 */
export function mergeMap<T, I, R>(this: Observable<T>, project: (value: T, index: number) => ObservableInput<I>,
                                  resultSelector?: ((outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R) | number,
                                  concurrent: number = Number.POSITIVE_INFINITY): Observable<I | R> {
  if (typeof resultSelector === 'number') {
    concurrent = <number>resultSelector;
    resultSelector = null;
  }
  return this.lift(new MergeMapOperator(project, <any>resultSelector, concurrent));
}

export class MergeMapOperator<T, I, R> implements Operator<T, I> {
  constructor(private project: (value: T, index: number) => ObservableInput<I>,
              private resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R,
              private concurrent: number = Number.POSITIVE_INFINITY) {
  }

  call(observer: Subscriber<I>, source: any): any {
    return source.subscribe(new MergeMapSubscriber(
      observer, this.project, this.resultSelector, this.concurrent
    ));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class MergeMapSubscriber<T, I, R> extends OuterSubscriber<T, I> {
  private hasCompleted: boolean = false;
  private buffer: T[] = [];
  private active: number = 0;
  protected index: number = 0;

  constructor(destination: Subscriber<I>,
              private project: (value: T, index: number) => ObservableInput<I>,
              private resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R,
              private concurrent: number = Number.POSITIVE_INFINITY) {
    super(destination);
  }

  protected _next(value: T): void {
    if (this.active < this.concurrent) {
      this._tryNext(value);
    } else {
      this.buffer.push(value);
    }
  }

  protected _tryNext(value: T) {
    let result: ObservableInput<I>;
    const index = this.index++;
    try {
      result = this.project(value, index);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.active++;
    this._innerSub(result, value, index);
  }

  private _innerSub(ish: ObservableInput<I>, value: T, index: number): void {
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
    if (this.resultSelector) {
      this._notifyResultSelector(outerValue, innerValue, outerIndex, innerIndex);
    } else {
      this.destination.next(innerValue);
    }
  }

  private _notifyResultSelector(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) {
    let result: R;
    try {
      result = this.resultSelector(outerValue, innerValue, outerIndex, innerIndex);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
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
