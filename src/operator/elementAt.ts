import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { ArgumentOutOfRangeError } from '../util/ArgumentOutOfRangeError';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';

/**
 * 只发出单个值，这个值位于源 Observable 的发送序列中的指定 `index` 处。
 *
 * <span class="informal">只发出第i个值, 然后完成。</span>
 *
 * <img src="./img/elementAt.png" width="100%">
 * 
 * `elementAt` 返回的 Observable 会发出源 Observable 指定 `index` 处的项，如果
 * `index` 超出范围并且提供了 `default` 参数的话，会发出一个默认值。如果没有提供
 * `default` 参数并且 `index` 超出范围，那么输出 Observable 会发出一个 
 * `ArgumentOutOfRangeError` 错误。
 *
 * @example <caption>只发出第三次的点击事件</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.elementAt(2);
 * result.subscribe(x => console.log(x));
 *
 * // 结果：
 * // click 1 = nothing
 * // click 2 = nothing
 * // click 3 = 打印到控制台的 MouseEvent 对象
 *
 * @see {@link first}
 * @see {@link last}
 * @see {@link skip}
 * @see {@link single}
 * @see {@link take}
 *
 * @throws {ArgumentOutOfRangeError} 当使用 `elementAt(i)` 时，如果 `i < 0` 或
 * 在发送第i个 `next` 通知前 Observable 已经完成了，它会发送 ArgumentOutOrRangeError 
 * 给观察者的 `error` 回调函数。
 *
 * @param {number} index 是 Subscription 开始后的第i个通知的索引数值，该值是从 `0` 开始。
 * @param {T} [defaultValue] 缺失索引时返回的默认值。
 * @return {Observable} 如果能找到这个项的话，那么该 Observable 发出此单个项。找不到时，如果有给定
 * 的默认值，则发出默认值，否则发出错误。
 * @method elementAt
 * @owner Observable
 */
export function elementAt<T>(this: Observable<T>, index: number, defaultValue?: T): Observable<T> {
  return this.lift(new ElementAtOperator(index, defaultValue));
}

class ElementAtOperator<T> implements Operator<T, T> {

  constructor(private index: number, private defaultValue?: T) {
    if (index < 0) {
      throw new ArgumentOutOfRangeError;
    }
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new ElementAtSubscriber(subscriber, this.index, this.defaultValue));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class ElementAtSubscriber<T> extends Subscriber<T> {

  constructor(destination: Subscriber<T>, private index: number, private defaultValue?: T) {
    super(destination);
  }

  protected _next(x: T) {
    if (this.index-- === 0) {
      this.destination.next(x);
      this.destination.complete();
    }
  }

  protected _complete() {
    const destination = this.destination;
    if (this.index >= 0) {
      if (typeof this.defaultValue !== 'undefined') {
        destination.next(this.defaultValue);
      } else {
        destination.error(new ArgumentOutOfRangeError);
      }
    }
    destination.complete();
  }
}
