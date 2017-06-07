import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Observer } from '../Observer';
import { Subscriber } from '../Subscriber';

/**
 * 计算源的发送数量，并当源完成时发出该数值。
 *
 * <span class="informal">当源完成的时候，告知总共发送了多少个值。</span>
 *
 * <img src="./img/count.png" width="100%">
 *
 * `count` 将发送数据的 Observable 转化为只发出源 Observable 总共发出的数据项的 Observable。 
 * 如果源 Observable 发生错误, `count`将会发出错误而不是发出值。 如果源 Observable
 * 一直不终结, `count` 既不会终结也不会发出数据。 这个操作符接受可选的`predicate`函数做为参数,
 * 在这种情况下，输出则表示源值中满足 predicate 函数的值的数量。
 *
 * @example <caption>记录第一次点击之前经过了几秒</caption>
 * var seconds = Rx.Observable.interval(1000);
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var secondsBeforeClick = seconds.takeUntil(clicks);
 * var result = secondsBeforeClick.count();
 * result.subscribe(x => console.log(x));
 *
 * @example <caption>记录1到7中间有多少个素数</caption>
 * var numbers = Rx.Observable.range(1, 7);
 * var result = numbers.count(i => i % 2 === 1);
 * result.subscribe(x => console.log(x));
 *
 * // 结果是:
 * // 4
 *
 * @see {@link max}
 * @see {@link min}
 * @see {@link reduce}
 *
 * @param {function(value: T, i: number, source: Observable<T>): boolean} [predicate] A
 * boolean 函数，用来选择哪些值会被计数。 参数如下：
 * - `value`: 来自源的值
 * - `index`: 来自投射的 Observable 的值的 "index"（从0开始）
 * - `source`: 源 Observable 自身实例。
 * @return {Observable} 数字类型的 Observable，该数字表示如上所述的计数。
 * @method count
 * @owner Observable
 */
export function count<T>(this: Observable<T>, predicate?: (value: T, index: number, source: Observable<T>) => boolean): Observable<number> {
  return this.lift(new CountOperator(predicate, this));
}

class CountOperator<T> implements Operator<T, number> {
  constructor(private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private source?: Observable<T>) {
  }

  call(subscriber: Subscriber<number>, source: any): any {
    return source.subscribe(new CountSubscriber(subscriber, this.predicate, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class CountSubscriber<T> extends Subscriber<T> {
  private count: number = 0;
  private index: number = 0;

  constructor(destination: Observer<number>,
              private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private source?: Observable<T>) {
    super(destination);
  }

  protected _next(value: T): void {
    if (this.predicate) {
      this._tryPredicate(value);
    } else {
      this.count++;
    }
  }

  private _tryPredicate(value: T) {
    let result: any;

    try {
      result = this.predicate(value, this.index++, this.source);
    } catch (err) {
      this.destination.error(err);
      return;
    }

    if (result) {
      this.count++;
    }
  }

  protected _complete(): void {
    this.destination.next(this.count);
    this.destination.complete();
  }
}
