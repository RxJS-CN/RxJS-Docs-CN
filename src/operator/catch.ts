import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable, ObservableInput } from '../Observable';

import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 捕获observable中的错误，可以通过返回一个新的observable或者错误对象来处理.
 *
 * <img src="./img/catch.png" width="100%">
 *
 * @example <caption>当发生错误的时候通过返回一个新的Observable继续</caption>
 *
 * Observable.of(1, 2, 3, 4, 5)
 *   .map(n => {
 * 	   if (n == 4) {
 * 	     throw 'four!';
 *     }
 *	   return n;
 *   })
 *   .catch(err => Observable.of('I', 'II', 'III', 'IV', 'V'))
 *   .subscribe(x => console.log(x));
 *   // 1, 2, 3, I, II, III, IV, V
 *
 * @example <caption>当发生错误的时候重试源Observable, 和retry()操作符类似</caption>
 *
 * Observable.of(1, 2, 3, 4, 5)
 *   .map(n => {
 * 	   if (n === 4) {
 * 	     throw 'four!';
 *     }
 * 	   return n;
 *   })
 *   .catch((err, caught) => caught)
 *   .take(30)
 *   .subscribe(x => console.log(x));
 *   // 1, 2, 3, 1, 2, 3, ...
 *
 * @example <caption>抛出一个新的错误当源Observable发生错误的时候</caption>
 *
 * Observable.of(1, 2, 3, 4, 5)
 *   .map(n => {
 *     if (n == 4) {
 *       throw 'four!';
 *     }
 *     return n;
 *   })
 *   .catch(err => {
 *     throw 'error in source. Details: ' + err;
 *   })
 *   .subscribe(
 *     x => console.log(x),
 *     err => console.log(err)
 *   );
 *   // 1, 2, 3, error in source. Details: four!
 *
 * @param {function} selector 函数接受`err`参数, error对象, `caught`参数, 源observable,
 * 当你想重试的时候返回它即可. 任何被`selector`返回的observable都会被用来代替源observable.
 * @return {Observable} 源observable或者捕获函数返回的选择器函数返回的observable.
 * @method catch
 * @name catch
 * @owner Observable
 */
export function _catch<T, R>(this: Observable<T>, selector: (err: any, caught: Observable<T>) => ObservableInput<R>): Observable<T | R> {
  const operator = new CatchOperator(selector);
  const caught = this.lift(operator);
  return (operator.caught = caught);
}

class CatchOperator<T, R> implements Operator<T, T | R> {
  caught: Observable<T>;

  constructor(private selector: (err: any, caught: Observable<T>) => ObservableInput<T | R>) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new CatchSubscriber(subscriber, this.selector, this.caught));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class CatchSubscriber<T, R> extends OuterSubscriber<T, T | R> {
  constructor(destination: Subscriber<any>,
              private selector: (err: any, caught: Observable<T>) => ObservableInput<T | R>,
              private caught: Observable<T>) {
    super(destination);
  }

  // NOTE: overriding `error` instead of `_error` because we don't want
  // to have this flag this subscriber as `isStopped`. We can mimic the
  // behavior of the RetrySubscriber (from the `retry` operator), where
  // we unsubscribe from our source chain, reset our Subscriber flags,
  // then subscribe to the selector result.
  error(err: any) {
    if (!this.isStopped) {
      let result: any;
      try {
        result = this.selector(err, this.caught);
      } catch (err2) {
        super.error(err2);
        return;
      }
      this._unsubscribeAndRecycle();
      this.add(subscribeToResult(this, result));
    }
  }
}
