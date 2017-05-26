import { Operator } from '../Operator';
import { Observable, ObservableInput } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/* tslint:disable:max-line-length */
export function exhaustMap<T, R>(this: Observable<T>, project: (value: T, index: number) => ObservableInput<R>): Observable<R>;
export function exhaustMap<T, I, R>(this: Observable<T>, project: (value: T, index: number) => ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 将每个源值投射成 Observable，只有当前一个投射的 Observable 已经完成的话，
 * 这个 Observable 才会被合并到输出 Observable 中。
 *
 * <span class="informal">把每个值映射成 Observable，然后使用 {@link exhaust} 
 * 操作符打平所有的内部 Observables 。</span>
 *
 * <img src="./img/exhaustMap.png" width="100%">
 *
 * 返回的 Observable 基于应用一个函数来发送项，该函数提供给源 Observable 发出的每个项，
 * 并返回一个(所谓的“内部”) Observable 。当它将源值投射成 Observable 时，输出 Observable 
 * 开始发出由投射的 Observable 发出的项。然而，如果前一个投射的 Observable 还未完成的话，
 * 那么 `exhaustMap` 会忽略每个新投射的 Observable 。一旦完成，它将接受并打平下一个
 * 内部 Observable ，然后重复此过程。
 *
 * @example <caption>只要没有当前活动的计时器，那么每次点击就会运行一个有限的计时器。</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.exhaustMap((ev) => Rx.Observable.interval(1000).take(5));
 * result.subscribe(x => console.log(x));
 *
 * @see {@link concatMap}
 * @see {@link exhaust}
 * @see {@link mergeMap}
 * @see {@link switchMap}
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
 * @return {Observable} 这个 Observable 包含源中每项的投射 Observable，
 * 忽略在前一个 Observable 完成之前就已经开始的 Observable。
 * @method exhaustMap
 * @owner Observable
 */
export function exhaustMap<T, I, R>(this: Observable<T>, project: (value: T, index: number) => ObservableInput<I>,
                                    resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): Observable<R> {
  return this.lift(new SwitchFirstMapOperator(project, resultSelector));
}

class SwitchFirstMapOperator<T, I, R> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => ObservableInput<I>,
              private resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new SwitchFirstMapSubscriber(subscriber, this.project, this.resultSelector));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SwitchFirstMapSubscriber<T, I, R> extends OuterSubscriber<T, I> {
  private hasSubscription: boolean = false;
  private hasCompleted: boolean = false;
  private index: number = 0;

  constructor(destination: Subscriber<R>,
              private project: (value: T, index: number) => ObservableInput<I>,
              private resultSelector?: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R) {
    super(destination);
  }

  protected _next(value: T): void {
    if (!this.hasSubscription) {
      this.tryNext(value);
    }
  }

  private tryNext(value: T): void {
    const index = this.index++;
    const destination = this.destination;
    try {
      const result = this.project(value, index);
      this.hasSubscription = true;
      this.add(subscribeToResult(this, result, value, index));
    } catch (err) {
      destination.error(err);
    }
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (!this.hasSubscription) {
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
    try {
      const result = resultSelector(outerValue, innerValue, outerIndex, innerIndex);
      destination.next(result);
    } catch (err) {
      destination.error(err);
    }
  }

  notifyError(err: any): void {
    this.destination.error(err);
  }

  notifyComplete(innerSub: Subscription): void {
    this.remove(innerSub);

    this.hasSubscription = false;
    if (this.hasCompleted) {
      this.destination.complete();
    }
  }
}
