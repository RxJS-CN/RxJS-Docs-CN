import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { EmptyError } from '../util/EmptyError';

/* tslint:disable:max-line-length */
export function last<T, S extends T>(this: Observable<T>,
                                     predicate: (value: T, index: number, source: Observable<T>) => value is S): Observable<S>;
export function last<T, S extends T, R>(this: Observable<T>,
                                        predicate: (value: T | S, index: number, source: Observable<T>) => value is S,
                                        resultSelector: (value: S, index: number) => R, defaultValue?: R): Observable<R>;
export function last<T, S extends T>(this: Observable<T>,
                                     predicate: (value: T, index: number, source: Observable<T>) => value is S,
                                     resultSelector: void,
                                     defaultValue?: S): Observable<S>;
export function last<T>(this: Observable<T>,
                        predicate?: (value: T, index: number, source: Observable<T>) => boolean): Observable<T>;
export function last<T, R>(this: Observable<T>,
                           predicate: (value: T, index: number, source: Observable<T>) => boolean,
                           resultSelector?: (value: T, index: number) => R,
                           defaultValue?: R): Observable<R>;
export function last<T>(this: Observable<T>,
                        predicate: (value: T, index: number, source: Observable<T>) => boolean,
                        resultSelector: void,
                        defaultValue?: T): Observable<T>;
/* tslint:enable:max-line-length */

/**
 * 返回的 Observable 只发出由源 Observable 发出的最后一个值。它可以接收一个可选的 predicate 函数作为
 * 参数，如果传入 predicate 的话则发送的不是源 Observable 的最后一项，而是发出源 Observable 中
 * 满足 predicate 函数的最后一项。
 *
 * <img src="./img/last.png" width="100%">
 *
 * @throws {EmptyError} 如果 Observale 完成前还没有发出任何 `next` 通知的话，就会
 * 发送 EmptyError 给观察者的 `error` 回调函数。
 * @param {function} predicate - 任何由源 Observable 发出的项都必须满足的条件函数。
 * @return {Observable} 该 Observable 只发出源 Observable 中满足给定条件的最后一项，
 * 或者没有任何项满足条件时发出 NoSuchElementException 。
 * @throws - 如果在源 Observable 中没有匹配 predicate 函数的项，则抛出。
 * @method last
 * @owner Observable
 */
export function last<T, R>(this: Observable<T>, predicate?: (value: T, index: number, source: Observable<T>) => boolean,
                           resultSelector?: ((value: T, index: number) => R) | void,
                           defaultValue?: R): Observable<T | R> {
  return this.lift(new LastOperator(predicate, resultSelector, defaultValue, this));
}

class LastOperator<T, R> implements Operator<T, R> {
  constructor(private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private resultSelector?: ((value: T, index: number) => R) | void,
              private defaultValue?: any,
              private source?: Observable<T>) {
  }

  call(observer: Subscriber<R>, source: any): any {
    return source.subscribe(new LastSubscriber(observer, this.predicate, this.resultSelector, this.defaultValue, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class LastSubscriber<T, R> extends Subscriber<T> {
  private lastValue: T | R;
  private hasValue: boolean = false;
  private index: number = 0;

  constructor(destination: Subscriber<R>,
              private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private resultSelector?: ((value: T, index: number) => R) | void,
              private defaultValue?: any,
              private source?: Observable<T>) {
    super(destination);
    if (typeof defaultValue !== 'undefined') {
      this.lastValue = defaultValue;
      this.hasValue = true;
    }
  }

  protected _next(value: T): void {
    const index = this.index++;
    if (this.predicate) {
      this._tryPredicate(value, index);
    } else {
      if (this.resultSelector) {
        this._tryResultSelector(value, index);
        return;
      }
      this.lastValue = value;
      this.hasValue = true;
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
      if (this.resultSelector) {
        this._tryResultSelector(value, index);
        return;
      }
      this.lastValue = value;
      this.hasValue = true;
    }
  }

  private _tryResultSelector(value: T, index: number) {
    let result: any;
    try {
      result = (<any>this).resultSelector(value, index);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.lastValue = result;
    this.hasValue = true;
  }

  protected _complete(): void {
    const destination = this.destination;
    if (this.hasValue) {
      destination.next(this.lastValue);
      destination.complete();
    } else {
      destination.error(new EmptyError);
    }
  }
}
