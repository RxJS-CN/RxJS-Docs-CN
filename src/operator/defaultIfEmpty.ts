import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';

/* tslint:disable:max-line-length */
export function defaultIfEmpty<T>(this: Observable<T>, defaultValue?: T): Observable<T>;
export function defaultIfEmpty<T, R>(this: Observable<T>, defaultValue?: R): Observable<T | R>;
/* tslint:enable:max-line-length */

/**
 * 如果源 Observable 在完成之前没有发出任何 next 值，则发出给定的值，否则返回 Observable 的镜像。
 *
 * <span class="informal">如果源Observable本来就是空的,那么这个操作符会发出一个默认值。</span>
 *
 * <img src="./img/defaultIfEmpty.png" width="100%">
 *
 * `defaultIfEmpty` 发出源 Observable 发出的值或指定的默认值，如果源 Observable 是空的(在完成之前没有发出任何 next 值)。
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
 * @param {any} [defaultValue=null] 如果源Observable是空的话使用的默认值。
 * @return {Observable} Observable，
 * 要么发出特定的`defaultValue`, 要么发出源Observable发出的数据。
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
