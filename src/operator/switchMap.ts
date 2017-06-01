import { Operator } from '../Operator';
import { Observable, ObservableInput } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/* tslint:disable:max-line-length */
export function switchMap<T, R>(this: Observable<T>, project: (value: T, index: number) => ObservableInput<R>): Observable<R>;
export function switchMap<T, I, R>(this: Observable<T>, project: (value: T, index: number) => ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 将每个源值投射成 Observable，该 Observable 会合并到输出 Observable 中，
 * 并且只发出最新投射的 Observable 中的值。
 *
 * <span class="informal">将每个值映射成 Observable ，然后使用 {@link switch} 
 * 打平所有的内部 Observables 。</span>
 *
 * <img src="./img/switchMap.png" width="100%">
 *
 * 返回的 Observable 基于应用一个函数来发送项，该函数提供给源 Observable 发出的每个项，
 * 并返回一个(所谓的“内部”) Observable 。每次观察到这些内部 Observables 的其中一个时，
 * 输出 Observable 将开始发出该内部 Observable 所发出的项。当发出一个新的内部 
 * Observable 时，`switchMap` 会停止发出先前发出的内部 Observable 并开始发出新的内部 
 * Observable 的值。后续的内部 Observables 也是如此。
 *
 * @example <caption>每次点击返回一个 interval Observable</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.switchMap((ev) => Rx.Observable.interval(1000));
 * result.subscribe(x => console.log(x));
 *
 * @see {@link concatMap}
 * @see {@link exhaustMap}
 * @see {@link mergeMap}
 * @see {@link switch}
 * @see {@link switchMapTo}
 *
 * @param {function(value: T, ?index: number): ObservableInput} project 函数，
 * 当应用于源 Observable 发出的项时，返回一个 Observable 。
 * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]
 * 函数，它用于产生基于值的输出 Observable 和源(外部)发送和内部 Observable 发送的索引。
 * 传递给这个函数参数有：
 * - `outerValue`: 来自源的值
 * - `innerValue`: 来自投射的 Observable 的值
 * - `outerIndex`: 来自源的值的 "index"
 * - `innerIndex`: 来自投射的 Observable 的值的 "index"
 * @return {Observable} 该 Observable 发出由源 Observable 发出的每项应用投射函数
 * (和可选的 `resultSelector`)后的结果，并只接收最新投射的内部 Observable 的值。
 * @method switchMap
 * @owner Observable
 */
export function switchMap<T, I, R>(this: Observable<T>, project: (value: T, index: number) => ObservableInput<I>,
                                   resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<I | R> {
  return this.lift(new SwitchMapOperator(project, resultSelector));
}

class SwitchMapOperator<T, I, R> implements Operator<T, I> {
  constructor(private project: (value: T, index: number) => ObservableInput<I>,
              private resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R) {
  }

  call(subscriber: Subscriber<I>, source: any): any {
    return source.subscribe(new SwitchMapSubscriber(subscriber, this.project, this.resultSelector));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SwitchMapSubscriber<T, I, R> extends OuterSubscriber<T, I> {
  private index: number = 0;
  private innerSubscription: Subscription;

  constructor(destination: Subscriber<I>,
              private project: (value: T, index: number) => ObservableInput<I>,
              private resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R) {
    super(destination);
  }

  protected _next(value: T) {
    let result: ObservableInput<I>;
    const index = this.index++;
    try {
      result = this.project(value, index);
    } catch (error) {
      this.destination.error(error);
      return;
    }
    this._innerSub(result, value, index);
  }

  private _innerSub(result: ObservableInput<I>, value: T, index: number) {
    const innerSubscription = this.innerSubscription;
    if (innerSubscription) {
      innerSubscription.unsubscribe();
    }
    this.add(this.innerSubscription = subscribeToResult(this, result, value, index));
  }

  protected _complete(): void {
    const {innerSubscription} = this;
    if (!innerSubscription || innerSubscription.closed) {
      super._complete();
    }
  }

  protected _unsubscribe() {
    this.innerSubscription = null;
  }

  notifyComplete(innerSub: Subscription): void {
    this.remove(innerSub);
    this.innerSubscription = null;
    if (this.isStopped) {
      super._complete();
    }
  }

  notifyNext(outerValue: T, innerValue: I,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, I>): void {
    if (this.resultSelector) {
      this._tryNotifyNext(outerValue, innerValue, outerIndex, innerIndex);
    } else {
      this.destination.next(innerValue);
    }
  }

  private _tryNotifyNext(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): void {
    let result: R;
    try {
      result = this.resultSelector(outerValue, innerValue, outerIndex, innerIndex);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
  }
}
