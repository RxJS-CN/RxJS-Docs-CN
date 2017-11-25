import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable, ObservableInput } from '../Observable';

import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 捕获 observable 中的错误，可以通过返回一个新的 observable 或者抛出错误对象来处理。
 *
 * <img src="./img/catch.png" width="100%">
 *
 * @example <caption>当发生错误的时候通过返回一个新的 Observable 继续运行</caption>
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
 * @example <caption>当发生错误的时候重试源 Observable, 和retry()操作符类似</caption>
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
 * @example <caption>当源 Observable 发生错误的时候，抛出一个新的错误</caption>
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
 * @param {function} selector 该函数接受 `err` 参数，即错误对象，还接受 `caught` 参数，即源 Observable，
 * 当你想“重试”的时候返回它即可。 无论 `selector` 函数返回的 observable 是什么，都会被用来继续执行 observable 链。
 * @return {Observable} 该 Observable 源自源 Observable 或 selector 函数返回的 Observable。
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
