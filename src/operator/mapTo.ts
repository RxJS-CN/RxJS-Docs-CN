import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';

/**
 * 每次源 Observble 发出值时，都在输出 Observable 上发出给定的常量值。
 *
 * <span class="informal">类似于 {@link map}，但它每一次都把源值映射成同一个输出值。</span>
 *
 * <img src="./img/mapTo.png" width="100%">
 *
 * 接收常量 `value` 作为参数，并每当源 Observable 发出值时都发出这个值。换句话说，
 * 就是忽略实际的源值，然后简单地使用这个发送时间点以知道何时发出给定的 `value` 。
 *
 * @example <caption>把每次点击映射成字符串 'Hi'</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var greetings = clicks.mapTo('Hi');
 * greetings.subscribe(x => console.log(x));
 *
 * @see {@link map}
 *
 * @param {any} value 将每个源值映射成的值。
 * @return {Observable} 该 Observable 在每次源 Observable 发出值的时候发出给定
 * 的 `value` 。
 * @method mapTo
 * @owner Observable
 */
export function mapTo<T, R>(this: Observable<T>, value: R): Observable<R> {
  return this.lift(new MapToOperator(value));
}

class MapToOperator<T, R> implements Operator<T, R> {

  value: R;

  constructor(value: R) {
    this.value = value;
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new MapToSubscriber(subscriber, this.value));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class MapToSubscriber<T, R> extends Subscriber<T> {

  value: R;

  constructor(destination: Subscriber<R>, value: R) {
    super(destination);
    this.value = value;
  }

  protected _next(x: T) {
    this.destination.next(this.value);
  }
}
