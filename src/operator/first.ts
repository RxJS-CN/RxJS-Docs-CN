import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { EmptyError } from '../util/EmptyError';

/* tslint:disable:max-line-length */
export function first<T, S extends T>(this: Observable<T>,
                                      predicate: (value: T, index: number, source: Observable<T>) => value is S): Observable<S>;
export function first<T, S extends T, R>(this: Observable<T>,
                                         predicate: (value: T | S, index: number, source: Observable<T>) => value is S,
                                         resultSelector: (value: S, index: number) => R, defaultValue?: R): Observable<R>;
export function first<T, S extends T>(this: Observable<T>,
                                      predicate: (value: T, index: number, source: Observable<T>) => value is S,
                                      resultSelector: void,
                                      defaultValue?: S): Observable<S>;
export function first<T>(this: Observable<T>,
                         predicate?: (value: T, index: number, source: Observable<T>) => boolean): Observable<T>;
export function first<T, R>(this: Observable<T>,
                            predicate: (value: T, index: number, source: Observable<T>) => boolean,
                            resultSelector?: (value: T, index: number) => R,
                            defaultValue?: R): Observable<R>;
export function first<T>(this: Observable<T>,
                         predicate: (value: T, index: number, source: Observable<T>) => boolean,
                         resultSelector: void,
                         defaultValue?: T): Observable<T>;

/**
 * 只发出由源 Observable 所发出的值中第一个(或第一个满足条件的值)。
 *
 * <span class="informal">只发出第一个值。或者只发出第一个通过测试的值。</span>
 *
 * <img src="./img/first.png" width="100%">
 *
 * 如果不使用参数调用，`first` 会发出源 Observable 中的第一个值，然后完成。如果使用
 * `predicate` 函数来调用，`first` 会发出源 Observable 第一个满足条件的值。它还可以
 * 接收 `resultSelector` 函数根据输入值生成输出值，假如在源 Observable 完成前无法发
 * 处一个有效值的话，那么会发出 `defaultValue` 。如果没有提供 `defaultValue` 并且也
 * 找不到匹配的元素，则抛出错误。
 *
 * @example <caption>只发出第一次点击 DOM 的事件</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.first();
 * result.subscribe(x => console.log(x));
 *
 * @example <caption>只发出第一次点击 DIV 元素的事件</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.first(ev => ev.target.tagName === 'DIV');
 * result.subscribe(x => console.log(x));
 *
 * @see {@link filter}
 * @see {@link find}
 * @see {@link take}
 *
 * @throws {EmptyError} 如果在 Observable 完成之前还没有发出任何 `next` 通知的话，
 * 就把 EmptyError 发送给观察者的 `error` 回调函数。
 *
 * @param {function(value: T, index: number, source: Observable<T>): boolean} [predicate]
 * 使用每项来调用的可选函数，用于测试是否符合条件。
 * @param {function(value: T, index: number): R} [resultSelector] 函数，它基于源 
 * Observable 的值和索引来生成输出 Observable 的值。传给这个函数的参数有：
 * - `value`: 在源 Observable 上发出的值。
 * - `index`: 源值的索引。
 * @param {R} [defaultValue] 假如在源 Observable 上没有找到有效值，就会发出这个
 * 默认值。
 * @return {Observable<T|R>} 符合条件的第一项的 Observable 。
 * @method first
 * @owner Observable
 */
export function first<T, R>(this: Observable<T>, predicate?: (value: T, index: number, source: Observable<T>) => boolean,
                            resultSelector?: ((value: T, index: number) => R) | void,
                            defaultValue?: R): Observable<T | R> {
  return this.lift(new FirstOperator(predicate, resultSelector, defaultValue, this));
}

class FirstOperator<T, R> implements Operator<T, R> {
  constructor(private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private resultSelector?: ((value: T, index: number) => R) | void,
              private defaultValue?: any,
              private source?: Observable<T>) {
  }

  call(observer: Subscriber<R>, source: any): any {
    return source.subscribe(new FirstSubscriber(observer, this.predicate, this.resultSelector, this.defaultValue, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class FirstSubscriber<T, R> extends Subscriber<T> {
  private index: number = 0;
  private hasCompleted: boolean = false;
  private _emitted: boolean = false;

  constructor(destination: Subscriber<R>,
              private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private resultSelector?: ((value: T, index: number) => R) | void,
              private defaultValue?: any,
              private source?: Observable<T>) {
    super(destination);
  }

  protected _next(value: T): void {
    const index = this.index++;
    if (this.predicate) {
      this._tryPredicate(value, index);
    } else {
      this._emit(value, index);
    }
  }

  private _tryPredicate(value: T, index: number) {
    let result: any;
    try {
      result = this.predicate(value, index, this.source);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    if (result) {
      this._emit(value, index);
    }
  }

  private _emit(value: any, index: number) {
    if (this.resultSelector) {
      this._tryResultSelector(value, index);
      return;
    }
    this._emitFinal(value);
  }

  private _tryResultSelector(value: T, index: number) {
    let result: any;
    try {
      result = (<any>this).resultSelector(value, index);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this._emitFinal(result);
  }

  private _emitFinal(value: any) {
    const destination = this.destination;
    if (!this._emitted) {
      this._emitted = true;
      destination.next(value);
      destination.complete();
      this.hasCompleted = true;
    }
  }

  protected _complete(): void {
    const destination = this.destination;
    if (!this.hasCompleted && typeof this.defaultValue !== 'undefined') {
      destination.next(this.defaultValue);
      destination.complete();
    } else if (!this.hasCompleted) {
      destination.error(new EmptyError);
    }
  }
}
