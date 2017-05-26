import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';

/* tslint:disable:max-line-length */
export function filter<T, S extends T>(this: Observable<T>,
                                       predicate: (value: T, index: number) => value is S,
                                       thisArg?: any): Observable<S>;
export function filter<T>(this: Observable<T>,
                          predicate: (value: T, index: number) => boolean,
                          thisArg?: any): Observable<T>;
/* tslint:enable:max-line-length */

/**
 * 通过只发送源 Observable 的中满足指定 predicate 函数的项来进行过滤。
 *
 * <span class="informal">类似于
 * [Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)，
 * 它只会发出源 Observable 中符合标准函数的值。</span>
 *
 * <img src="./img/filter.png" width="100%">
 *
 * 类似于大家所熟知的 `Array.prototype.filter` 方法，此操作符从源 Observable 中
 * 接收值，将值传递给 `predicate` 函数并且只发出返回 `true` 的这些值。
 *
 * @example <caption>只发出目标是 DIV 元素的点击事件</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var clicksOnDivs = clicks.filter(ev => ev.target.tagName === 'DIV');
 * clicksOnDivs.subscribe(x => console.log(x));
 *
 * @see {@link distinct}
 * @see {@link distinctUntilChanged}
 * @see {@link distinctUntilKeyChanged}
 * @see {@link ignoreElements}
 * @see {@link partition}
 * @see {@link skip}

 * @param {function(value: T, index: number): boolean} predicate 评估源 Observable 
 * 所发出的每个值的函数。如果它返回 `true`，就发出值，如果是 `false` 则不会传给输出 
 * Observable 。`index` 参数是自订阅开始后发送序列的索引，是从 `0` 开始的。
 * @param {any} [thisArg] 可选参数，用来决定 `predicate` 函数中的 `this` 的值。
 * @return {Observable} 值的 Observable，这些值来自源 Observable 并且
 * 是 `predicate` 函数所允许的。
 * @method filter
 * @owner Observable
 */
export function filter<T>(this: Observable<T>, predicate: (value: T, index: number) => boolean,
                          thisArg?: any): Observable<T> {
  return this.lift(new FilterOperator(predicate, thisArg));
}

class FilterOperator<T> implements Operator<T, T> {
  constructor(private predicate: (value: T, index: number) => boolean,
              private thisArg?: any) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class FilterSubscriber<T> extends Subscriber<T> {

  count: number = 0;

  constructor(destination: Subscriber<T>,
              private predicate: (value: T, index: number) => boolean,
              private thisArg: any) {
    super(destination);
    this.predicate = predicate;
  }

  // the try catch block below is left specifically for
  // optimization and perf reasons. a tryCatcher is not necessary here.
  protected _next(value: T) {
    let result: any;
    try {
      result = this.predicate.call(this.thisArg, value, this.count++);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    if (result) {
      this.destination.next(value);
    }
  }
}
