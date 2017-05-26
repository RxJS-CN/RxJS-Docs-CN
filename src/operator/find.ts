import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';

/* tslint:disable:max-line-length */
export function find<T, S extends T>(this: Observable<T>,
                                     predicate: (value: T, index: number) => value is S,
                                     thisArg?: any): Observable<S>;
export function find<T>(this: Observable<T>,
                        predicate: (value: T, index: number) => boolean,
                        thisArg?: any): Observable<T>;
/* tslint:enable:max-line-length */

/**
 * 只发出源 Observable 所发出的值中第一个满足条件的值。
 *
 * <span class="informal">找到第一个通过测试的值并将其发出。</span>
 *
 * <img src="./img/find.png" width="100%">
 *
 * `find` 会查找源 Observable 中与 `predicate` 函数体现的指定条件匹配的第一项，然后
 * 将其返回。不同于 {@link first}，在 `find` 中 `predicate` 是必须的，而且如果没找到
 * 有效的值的话也不会发出错误。
 *
 * @example <caption>找到并发出第一个点击 DIV 元素的事件</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.find(ev => ev.target.tagName === 'DIV');
 * result.subscribe(x => console.log(x));
 *
 * @see {@link filter}
 * @see {@link first}
 * @see {@link findIndex}
 * @see {@link take}
 *
 * @param {function(value: T, index: number, source: Observable<T>): boolean} predicate
 * A function called with each item to test for condition matching.
 * @param {any} [thisArg] An optional argument to determine the value of `this`
 * in the `predicate` function.
 * @return {Observable<T>} An Observable of the first item that matches the
 * condition.
 * @param {function(value: T, index: number, source: Observable<T>): boolean} predicate
 * 使用每项来调用的函数，用于测试是否符合条件。
 * @param {any} [thisArg] 可选参数，用来决定 `predicate` 函数中的 `this` 的值。
 * @return {Observable<T>} 符合条件的第一项的 Observable 。
 * @method find
 * @owner Observable
 */
export function find<T>(this: Observable<T>, predicate: (value: T, index: number, source: Observable<T>) => boolean,
                        thisArg?: any): Observable<T> {
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate is not a function');
  }
  return <any>this.lift<any>(new FindValueOperator(predicate, this, false, thisArg));
}

export class FindValueOperator<T> implements Operator<T, T> {
  constructor(private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private source: Observable<T>,
              private yieldIndex: boolean,
              private thisArg?: any) {
  }

  call(observer: Subscriber<T>, source: any): any {
    return source.subscribe(new FindValueSubscriber(observer, this.predicate, this.source, this.yieldIndex, this.thisArg));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class FindValueSubscriber<T> extends Subscriber<T> {
  private index: number = 0;

  constructor(destination: Subscriber<T>,
              private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private source: Observable<T>,
              private yieldIndex: boolean,
              private thisArg?: any) {
    super(destination);
  }

  private notifyComplete(value: any): void {
    const destination = this.destination;

    destination.next(value);
    destination.complete();
    this.unsubscribe();
  }

  protected _next(value: T): void {
    const { predicate, thisArg } = this;
    const index = this.index++;
    try {
      const result = predicate.call(thisArg || this, value, index, this.source);
      if (result) {
        this.notifyComplete(this.yieldIndex ? index : value);
      }
    } catch (err) {
      this.destination.error(err);
      this.unsubscribe();
    }
  }

  protected _complete(): void {
    this.notifyComplete(this.yieldIndex ? -1 : undefined);
  }
}
