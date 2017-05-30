import { Observable, ObservableInput } from '../Observable';
import { FromObservable } from '../observable/FromObservable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { isArray } from '../util/isArray';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/* tslint:disable:max-line-length */
export function onErrorResumeNext<T, R>(this: Observable<T>, v: ObservableInput<R>): Observable<R>;
export function onErrorResumeNext<T, T2, T3, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<R>;
export function onErrorResumeNext<T, T2, T3, T4, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<R>;
export function onErrorResumeNext<T, T2, T3, T4, T5, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<R>;
export function onErrorResumeNext<T, T2, T3, T4, T5, T6, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<R> ;
export function onErrorResumeNext<T, R>(this: Observable<T>, ...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
export function onErrorResumeNext<T, R>(this: Observable<T>, array: ObservableInput<any>[]): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 当任何提供的 Observable 发出完成或错误通知时，它会立即地订阅已传入下一个 Observable 。
 *
 * <span class="informal">无论发生什么，都会执行一系列的 Observables ，即使这意味着要吞咽错误。</span>
 *
 * <img src="./img/onErrorResumeNext.png" width="100%">
 *
 * `onErrorResumeNext` 操作符接收一系列的 Observables ，可与直接作为参数或数组提供。如果没提供 Observable ，
 * 返回的 Observable 与源 Observable 的行为是相同的。
 *
 * `onErrorResumeNext` 返回的 Observable 通过订阅和重新发出源 Observable 的值开始。当流的值完成时，无论 Observable 
 * 是完成还是发出错误，`onErrorResumeNext` 都会订阅作为参数传给该方法的第一个 Observable 。它也会开始重新发出它的值，
 * 再一次，当流完成时，`onErrorResumeNext` 又会继续订阅已提供的系列 Observable 中另一个，无论前一个 Observable 
 * 是否完成或发生错误。这样的行为会持续到系列中没有更多的 Observable ，返回的 Observale 将在此时完成，即使最后订阅的
 * 流是以错误结束的。
 *
 * 因此， `onErrorResumeNext` 可以认为是某个版本的 {@link concat} 操作符，只是当它的输入 Observables 发生
 * 错误时，它更为宽容。然而，`concat` 只有当前一个 Observable 成功完成了，它才会订阅系列中的下个 Observable ，
 * 而 `onErrorResumeNext` 即使是以错误完成某个 Observalbe 时，它也会订阅下一个。
 *
 * 注意，对于由 Observables 发出的错误，你无法获得访问权限。特别是不要指望可以将这些出现在错误回调函数中的
 * 错误传递给  {@link subscribe} 。如果要根据 Observable 发出的错误采取特定的操作，应该尝试使用 {@link catch} 。
 *
 *
 * @example <caption>在 map 操作失败后订阅下一个 Observable </caption>
 * Rx.Observable.of(1, 2, 3, 0)
 *   .map(x => {
 *       if (x === 0) { throw Error(); }
         return 10 / x;
 *   })
 *   .onErrorResumeNext(Rx.Observable.of(1, 2, 3))
 *   .subscribe(
 *     val => console.log(val),
 *     err => console.log(err),          // 永远不会调用
 *     () => console.log('that\'s it!')
 *   );
 *
 * // 输出：
 * // 10
 * // 5
 * // 3.3333333333333335
 * // 1
 * // 2
 * // 3
 * // "that's it!"
 *
 * @see {@link concat}
 * @see {@link catch}
 *
 * @param {...ObservableInput} observables 传入的 Observables，可以直接传入，也可以作为数组传入。
 * @return {Observable} 该 Observable 发出源 Observable 的值，但如果发出错误，它会订阅下一个传入的 
 * Observable ，并以此类推，直到它完成或用完所有的 Observable 。
 * @method onErrorResumeNext
 * @owner Observable
 */

export function onErrorResumeNext<T, R>(this: Observable<T>, ...nextSources: Array<ObservableInput<any> |
                                                       Array<ObservableInput<any>> |
                                                       ((...values: Array<any>) => R)>): Observable<R> {
  if (nextSources.length === 1 && isArray(nextSources[0])) {
    nextSources = <Array<Observable<any>>>nextSources[0];
  }

  return this.lift(new OnErrorResumeNextOperator<T, R>(nextSources));
}

/* tslint:disable:max-line-length */
export function onErrorResumeNextStatic<R>(v: ObservableInput<R>): Observable<R>;
export function onErrorResumeNextStatic<T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<R>;
export function onErrorResumeNextStatic<T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<R>;
export function onErrorResumeNextStatic<T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<R>;
export function onErrorResumeNextStatic<T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<R>;

export function onErrorResumeNextStatic<R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
export function onErrorResumeNextStatic<R>(array: ObservableInput<any>[]): Observable<R>;
/* tslint:enable:max-line-length */

export function onErrorResumeNextStatic<T, R>(...nextSources: Array<ObservableInput<any> |
                                                              Array<ObservableInput<any>> |
                                                              ((...values: Array<any>) => R)>): Observable<R> {
  let source: ObservableInput<any> = null;

  if (nextSources.length === 1 && isArray(nextSources[0])) {
    nextSources = <Array<ObservableInput<any>>>nextSources[0];
  }
  source = nextSources.shift();

  return new FromObservable(source, null).lift(new OnErrorResumeNextOperator<T, R>(nextSources));
}

class OnErrorResumeNextOperator<T, R> implements Operator<T, R> {
  constructor(private nextSources: Array<ObservableInput<any>>) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new OnErrorResumeNextSubscriber(subscriber, this.nextSources));
  }
}

class OnErrorResumeNextSubscriber<T, R> extends OuterSubscriber<T, R> {
  constructor(protected destination: Subscriber<T>,
              private nextSources: Array<ObservableInput<any>>) {
    super(destination);
  }

  notifyError(error: any, innerSub: InnerSubscriber<T, any>): void {
    this.subscribeToNextSource();
  }

  notifyComplete(innerSub: InnerSubscriber<T, any>): void {
    this.subscribeToNextSource();
  }

  protected _error(err: any): void {
    this.subscribeToNextSource();
  }

  protected _complete(): void {
    this.subscribeToNextSource();
  }

  private subscribeToNextSource(): void {
    const next = this.nextSources.shift();
    if (next) {
      this.add(subscribeToResult(this, next));
    } else {
      this.destination.complete();
    }
  }
}
