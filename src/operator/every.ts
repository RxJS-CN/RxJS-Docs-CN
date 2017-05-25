import { Operator } from '../Operator';
import { Observer } from '../Observer';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';

/**
 * 返回的 Observable 发出是否源 Observable 的每项都满足指定的条件。
 *
 * @example <caption>一个简单示例：如果所有元素都小于5就发出 `true`，反之 `false`</caption>
 *  Observable.of(1, 2, 3, 4, 5, 6)
 *     .every(x => x < 5)
 *     .subscribe(x => console.log(x)); // -> false
 *
 * @param {function} predicate 用来确定每一项是否满足指定条件的函数。
 * @param {any} [thisArg] 可选对象，作为回调函数中的 `this` 使用。
 * @return {Observable} 布尔值的 Observable，用来确定是否源 Observable 的所有项都满足指定条件。
 * @method every
 * @owner Observable
 */
export function every<T>(this: Observable<T>, predicate: (value: T, index: number, source: Observable<T>) => boolean,
                         thisArg?: any): Observable<boolean> {
  return this.lift(new EveryOperator(predicate, thisArg, this));
}

class EveryOperator<T> implements Operator<T, boolean> {
  constructor(private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg?: any,
              private source?: Observable<T>) {
  }

  call(observer: Subscriber<boolean>, source: any): any {
    return source.subscribe(new EverySubscriber(observer, this.predicate, this.thisArg, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class EverySubscriber<T> extends Subscriber<T> {
  private index: number = 0;

  constructor(destination: Observer<boolean>,
              private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg: any,
              private source?: Observable<T>) {
    super(destination);
    this.thisArg = thisArg || this;
  }

  private notifyComplete(everyValueMatch: boolean): void {
    this.destination.next(everyValueMatch);
    this.destination.complete();
  }

  protected _next(value: T): void {
    let result = false;
    try {
      result = this.predicate.call(this.thisArg, value, this.index++, this.source);
    } catch (err) {
      this.destination.error(err);
      return;
    }

    if (!result) {
      this.notifyComplete(false);
    }
  }

  protected _complete(): void {
    this.notifyComplete(true);
  }
}
