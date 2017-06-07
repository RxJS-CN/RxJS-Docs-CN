import { Observable, ObservableInput } from '../Observable';
import { ArrayObservable } from '../observable/ArrayObservable';
import { isArray } from '../util/isArray';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
const none = {};

/* tslint:disable:max-line-length */
export function combineLatest<T, R>(this: Observable<T>, project: (v1: T) => R): Observable<R>;
export function combineLatest<T, T2, R>(this: Observable<T>, v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R): Observable<R>;
export function combineLatest<T, T2, T3, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => R): Observable<R>;
export function combineLatest<T, T2, T3, T4, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R): Observable<R>;
export function combineLatest<T, T2, T3, T4, T5, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R): Observable<R>;
export function combineLatest<T, T2, T3, T4, T5, T6, R>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R): Observable<R> ;
export function combineLatest<T, T2>(this: Observable<T>, v2: ObservableInput<T2>): Observable<[T, T2]>;
export function combineLatest<T, T2, T3>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3, T4>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<[T, T2, T3, T4]>;
export function combineLatest<T, T2, T3, T4, T5>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<[T, T2, T3, T4, T5]>;
export function combineLatest<T, T2, T3, T4, T5, T6>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<[T, T2, T3, T4, T5, T6]> ;
export function combineLatest<T, R>(this: Observable<T>, ...observables: Array<ObservableInput<T> | ((...values: Array<T>) => R)>): Observable<R>;
export function combineLatest<T, R>(this: Observable<T>, array: ObservableInput<T>[]): Observable<Array<T>>;
export function combineLatest<T, TOther, R>(this: Observable<T>, array: ObservableInput<TOther>[], project: (v1: T, ...values: Array<TOther>) => R): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 组合多个 Observables 来创建一个 Observable ，该 Observable 的值根据每个输入 Observable 的最新值计算得出的。
 * 
 * <span class="informal">它将使用所有输入中的最新值计算公式，然后发出该公式的输出。</span>
 *
 * <img src="./img/combineLatest.png" width="100%">
 *
 * `combineLatest` 结合传入的多个 Observables。 通过顺序的订阅每个输入Observable, 在每次任一输入Observables发送的时候收集
 * 每个输入Observables最新的值组成一个数组, 然后要么将这个数组传给可选的投射函数并发送投射函数返回的结果,
 * 或者在没有提供投射函数时仅仅发出该数组。
 *
 * @example <caption>根据一个身高的 Observable 和一个体重的 Observable 动态的计算BMI指数</caption>
 * var weight = Rx.Observable.of(70, 72, 76, 79, 75);
 * var height = Rx.Observable.of(1.76, 1.77, 1.78);
 * var bmi = weight.combineLatest(height, (w, h) => w / (h * h));
 * bmi.subscribe(x => console.log('BMI is ' + x));
 *
 * // With output to console:
 * // BMI is 24.212293388429753
 * // BMI is 23.93948099205209
 * // BMI is 23.671253629592222
 *
 * @see {@link combineAll}
 * @see {@link merge}
 * @see {@link withLatestFrom}
 *
 * @param {ObservableInput} other 将要和源 Observable 结合的输入 Observable。 可以传入多个输入 Observables。
 * @param {function} [project] 可选的投射函数，将输出 Observable 返回的值投射为要发出的新的值。
 * @return {Observable} 该 Observable 为每个输入 Observable 的最新值的投射结果或数组。
 * @method combineLatest
 * @owner Observable
 */
export function combineLatest<T, R>(this: Observable<T>, ...observables: Array<ObservableInput<any> |
                                                       Array<ObservableInput<any>> |
                                                       ((...values: Array<any>) => R)>): Observable<R> {
  let project: (...values: Array<any>) => R = null;
  if (typeof observables[observables.length - 1] === 'function') {
    project = <(...values: Array<any>) => R>observables.pop();
  }

  // if the first and only other argument besides the resultSelector is an array
  // assume it's been called with `combineLatest([obs1, obs2, obs3], project)`
  if (observables.length === 1 && isArray(observables[0])) {
    observables = (<any>observables[0]).slice();
  }

  observables.unshift(this);

  return this.lift.call(new ArrayObservable(observables), new CombineLatestOperator(project));
}

export class CombineLatestOperator<T, R> implements Operator<T, R> {
  constructor(private project?: (...values: Array<any>) => R) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new CombineLatestSubscriber(subscriber, this.project));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class CombineLatestSubscriber<T, R> extends OuterSubscriber<T, R> {
  private active: number = 0;
  private values: any[] = [];
  private observables: any[] = [];
  private toRespond: number;

  constructor(destination: Subscriber<R>, private project?: (...values: Array<any>) => R) {
    super(destination);
  }

  protected _next(observable: any) {
    this.values.push(none);
    this.observables.push(observable);
  }

  protected _complete() {
    const observables = this.observables;
    const len = observables.length;
    if (len === 0) {
      this.destination.complete();
    } else {
      this.active = len;
      this.toRespond = len;
      for (let i = 0; i < len; i++) {
        const observable = observables[i];
        this.add(subscribeToResult(this, observable, observable, i));
      }
    }
  }

  notifyComplete(unused: Subscriber<R>): void {
    if ((this.active -= 1) === 0) {
      this.destination.complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    const values = this.values;
    const oldVal = values[outerIndex];
    const toRespond = !this.toRespond
      ? 0
      : oldVal === none ? --this.toRespond : this.toRespond;
    values[outerIndex] = innerValue;

    if (toRespond === 0) {
      if (this.project) {
        this._tryProject(values);
      } else {
        this.destination.next(values.slice());
      }
    }
  }

  private _tryProject(values: any[]) {
    let result: any;
    try {
      result = this.project.apply(this, values);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
  }
}
