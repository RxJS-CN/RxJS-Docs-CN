import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';

/* tslint:disable:max-line-length */
export function defaultIfEmpty<T>(this: Observable<T>, defaultValue?: T): Observable<T>;
export function defaultIfEmpty<T, R>(this: Observable<T>, defaultValue?: R): Observable<T | R>;
/* tslint:enable:max-line-length */

/**
 *  发出给定的值如果源Observable完成之前没有发送任何`next`值, 负责返回源Observable的镜像.
 *
 * <span class="informal">如果源Observable本来就是空的,这个操作符会发出默认的值.</span>
 *
 * <img src="./img/defaultIfEmpty.png" width="100%">
 *
 * `defaultIfEmpty` 发出源Observable发出的值或者一个特定的值如果源Observable是空(在完成之前
 * 没有发送任何next`值).
 *
 * @example <caption>如果在5秒内没有点击事件发生,发出"no clicks"</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var clicksBeforeFive = clicks.takeUntil(Rx.Observable.interval(5000));
 * var result = clicksBeforeFive.defaultIfEmpty('no clicks');
 * result.subscribe(x => console.log(x));
 *
 * @see {@link empty}
 * @see {@link last}
 *
 * @param {any} [defaultValue=null] 如果源Observable是空的话使用的默认值.
 * @return {Observable} Observable，要么发出特定的`defaultValue`如果源
 * Observable不发送数据, 要么发出源Observable发出的数据.
 * @method defaultIfEmpty
 * @owner Observable
 */
export function defaultIfEmpty<T, R>(this: Observable<T>, defaultValue: R = null): Observable<T | R> {
  return this.lift(new DefaultIfEmptyOperator(defaultValue));
}

class DefaultIfEmptyOperator<T, R> implements Operator<T, T | R> {

  constructor(private defaultValue: R) {
  }

  call(subscriber: Subscriber<T | R>, source: any): any {
    return source.subscribe(new DefaultIfEmptySubscriber(subscriber, this.defaultValue));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DefaultIfEmptySubscriber<T, R> extends Subscriber<T> {
  private isEmpty: boolean = true;

  constructor(destination: Subscriber<T | R>, private defaultValue: R) {
    super(destination);
  }

  protected _next(value: T): void {
    this.isEmpty = false;
    this.destination.next(value);
  }

  protected _complete(): void {
    if (this.isEmpty) {
      this.destination.next(this.defaultValue);
    }
    this.destination.complete();
  }
}
