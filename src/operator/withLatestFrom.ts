import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable, ObservableInput } from '../Observable';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/* tslint:disable:max-line-length */
export function withLatestFrom<T, R>(this: Observable<T>, project: (v1: T) => R): Observable<R>;
export function withLatestFrom<T, T2, R>(this: Observable<T>, v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R): Observable<R>;
export function withLatestFrom<T, T2, T3, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => R): Observable<R>;
export function withLatestFrom<T, T2, T3, T4, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R): Observable<R>;
export function withLatestFrom<T, T2, T3, T4, T5, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R): Observable<R>;
export function withLatestFrom<T, T2, T3, T4, T5, T6, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R): Observable<R> ;
export function withLatestFrom<T, T2>(this: Observable<T>, v2: ObservableInput<T2>): Observable<[T, T2]>;
export function withLatestFrom<T, T2, T3>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<[T, T2, T3]>;
export function withLatestFrom<T, T2, T3, T4>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<[T, T2, T3, T4]>;
export function withLatestFrom<T, T2, T3, T4, T5>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<[T, T2, T3, T4, T5]>;
export function withLatestFrom<T, T2, T3, T4, T5, T6>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<[T, T2, T3, T4, T5, T6]> ;
export function withLatestFrom<T, R>(this: Observable<T>, ...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
export function withLatestFrom<T, R>(this: Observable<T>, array: ObservableInput<any>[]): Observable<R>;
export function withLatestFrom<T, R>(this: Observable<T>, array: ObservableInput<any>[], project: (...values: Array<any>) => R): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 结合源 Observable 和另外的 Observables 以创建新的 Observable， 该 Observable 的值由每
 * 个 Observable 最新的值计算得出，当且仅当源发出的时候。
 *
 * <span class="informal">每当源 Observable 发出值，它会计算一个公式，此公式使用该值加上其他输入 Observable 的最新值，然后发出公式的输出结果。</span>
 *
 * <img src="./img/withLatestFrom.png" width="100%">
 *
 * `withLatestFrom` 结合源 Observablecombines（实例）和其他输入 Observables 的最新值，当且仅当 
 * source 发出数据时, 可选的使用 `project` 函数以决定输出 Observable 将要发出的值。
 * 在输出 Observable 发出值之前，所有的输入 Observables 都必须发出至少一个值。
 *
 * @example <caption>对于每个点击事件，发出一个包含最新时间和点击事件的数组。</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var timer = Rx.Observable.interval(1000);
 * var result = clicks.withLatestFrom(timer);
 * result.subscribe(x => console.log(x));
 *
 * @see {@link combineLatest}
 *
 * @param {ObservableInput} other 输入 Observable ，用来和源 Observable 结合。 可以传入多个输入 Observables。
 * @param {Function} [project] 将多个值合并的投射函数。顺序地接受所有 Observables 传入的值，第一个参数是源 Observable
 * 的值。 (`a.withLatestFrom(b, c, (a1, b1, c1) => a1 + b1 + c1)`)。 如果没有传入, 输入 Observable 会一直发送数组。
 * @return {Observable} 该 Observable 为一个拥有将每个输入 Observable 最新的值投射后的值, 或者一个包含所有输入 Observable 的最新值的数组。
 * @method withLatestFrom
 * @owner Observable
 */
export function withLatestFrom<T, R>(this: Observable<T>, ...args: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R> {
  let project: any;
  if (typeof args[args.length - 1] === 'function') {
    project = args.pop();
  }
  const observables = <Observable<any>[]>args;
  return this.lift(new WithLatestFromOperator(observables, project));
}

class WithLatestFromOperator<T, R> implements Operator<T, R> {
  constructor(private observables: Observable<any>[],
              private project?: (...values: any[]) => Observable<R>) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new WithLatestFromSubscriber(subscriber, this.observables, this.project));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class WithLatestFromSubscriber<T, R> extends OuterSubscriber<T, R> {
  private values: any[];
  private toRespond: number[] = [];

  constructor(destination: Subscriber<R>,
              private observables: Observable<any>[],
              private project?: (...values: any[]) => Observable<R>) {
    super(destination);
    const len = observables.length;
    this.values = new Array(len);

    for (let i = 0; i < len; i++) {
      this.toRespond.push(i);
    }

    for (let i = 0; i < len; i++) {
      let observable = observables[i];
      this.add(subscribeToResult<T, R>(this, observable, <any>observable, i));
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this.values[outerIndex] = innerValue;
    const toRespond = this.toRespond;
    if (toRespond.length > 0) {
      const found = toRespond.indexOf(outerIndex);
      if (found !== -1) {
        toRespond.splice(found, 1);
      }
    }
  }

  notifyComplete() {
    // noop
  }

  protected _next(value: T) {
    if (this.toRespond.length === 0) {
      const args = [value, ...this.values];
      if (this.project) {
        this._tryProject(args);
      } else {
        this.destination.next(args);
      }
    }
  }

  private _tryProject(args: any[]) {
    let result: any;
    try {
      result = this.project.apply(this, args);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
  }
}
