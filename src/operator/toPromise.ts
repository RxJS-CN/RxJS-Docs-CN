import { Observable } from '../Observable';
import { root } from '../util/root';

/* tslint:disable:max-line-length */
export function toPromise<T>(this: Observable<T>): Promise<T>;
export function toPromise<T>(this: Observable<T>, PromiseCtor: typeof Promise): Promise<T>;
/* tslint:enable:max-line-length */

/**
 * 将 Observable 序列转换为符合 ES2015 标准的 Promise 。
 *
 * @example
 * // 使用普通的 ES2015
 * let source = Rx.Observable
 *   .of(42)
 *   .toPromise();
 *
 * source.then((value) => console.log('Value: %s', value));
 * // => Value: 42
 *
 * // 被拒的 Promise
 * // 使用标准的 ES2015
 * let source = Rx.Observable
 *   .throw(new Error('woops'))
 *   .toPromise();
 *
 * source
 *   .then((value) => console.log('Value: %s', value))
 *   .catch((err) => console.log('Error: %s', err));
 * // => Error: Error: woops
 *
 * // 通过 config 进行设置
 * Rx.config.Promise = RSVP.Promise;
 *
 * let source = Rx.Observable
 *   .of(42)
 *   .toPromise();
 *
 * source.then((value) => console.log('Value: %s', value));
 * // => Value: 42
 *
 * // 通过方法进行设置
 * let source = Rx.Observable
 *   .of(42)
 *   .toPromise(RSVP.Promise);
 *
 * source.then((value) => console.log('Value: %s', value));
 * // => Value: 42
 *
 * @param {PromiseConstructor} [PromiseCtor] Promise 的构造函数。如果没有提供的话，
 * 它首先会在 `Rx.config.Promise` 中寻找构造函数，然后会回退成原生的 Promise 构造函数
 * (如果有的话)。
 * @return {Promise<T>} 符合 ES2015 标准的 Promise，它使用 Observable 序列的最后一个值。
 * @method toPromise
 * @owner Observable
 */
export function toPromise<T>(this: Observable<T>, PromiseCtor?: typeof Promise): Promise<T> {
  if (!PromiseCtor) {
    if (root.Rx && root.Rx.config && root.Rx.config.Promise) {
      PromiseCtor = root.Rx.config.Promise;
    } else if (root.Promise) {
      PromiseCtor = root.Promise;
    }
  }

  if (!PromiseCtor) {
    throw new Error('no Promise impl found');
  }

  return new PromiseCtor((resolve, reject) => {
    let value: any;
    this.subscribe((x: T) => value = x, (err: any) => reject(err), () => resolve(value));
  });
}
