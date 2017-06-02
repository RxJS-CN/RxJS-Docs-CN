import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';

/* tslint:disable:max-line-length */
export function scan<T>(this: Observable<T>, accumulator: (acc: T, value: T, index: number) => T, seed?: T): Observable<T>;
export function scan<T>(this: Observable<T>, accumulator: (acc: T[], value: T, index: number) => T[], seed?: T[]): Observable<T[]>;
export function scan<T, R>(this: Observable<T>, accumulator: (acc: R, value: T, index: number) => R, seed?: R): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 对源 Observable 使用累加器函数， 返回生成的中间值， 可选的初始值。
 *
 * <span class="informal">就想是 {@link reduce}, 但是发出目前的累计数当源发出数据的时候。</span>
 *
 * <img src="./img/scan.png" width="100%">
 *
 * 将所有源发出的数据结合起来， 使用一个累加器函数，该函数知道如何将新的值加入到累加器中。 
 * 这就像是{@link reduce}， 但是会发出中间的累加值。
 *
 * 返回一个 Observable， 该 Observable 对每个源 Observable 发出的值使用特定的累加器。 
 * 如果`seed`值提供了， 这个值会被累加器用作初始值。 如果`seed`值没有被提供， 源数据的第一项会被当做初始值。
 *
 * @example <caption>计数点击次数</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var ones = clicks.mapTo(1);
 * var seed = 0;
 * var count = ones.scan((acc, one) => acc + one, seed);
 * count.subscribe(x => console.log(x));
 *
 * @see {@link expand}
 * @see {@link mergeScan}
 * @see {@link reduce}
 *
 * @param {function(acc: R, value: T, index: number): R} 累加器
 * 对每个源数据调用的累加器函数。
 * @param {T|R} [seed] 初始值。
 * @return {Observable<R>} 带有累加功能的observable。
 * @method scan
 * @owner Observable
 */
export function scan<T, R>(this: Observable<T>, accumulator: (acc: R, value: T, index: number) => R, seed?: T | R): Observable<R> {
  let hasSeed = false;
  // providing a seed of `undefined` *should* be valid and trigger
  // hasSeed! so don't use `seed !== undefined` checks!
  // For this reason, we have to check it here at the original call site
  // otherwise inside Operator/Subscriber we won't know if `undefined`
  // means they didn't provide anything or if they literally provided `undefined`
  if (arguments.length >= 2) {
    hasSeed = true;
  }

  return this.lift(new ScanOperator(accumulator, seed, hasSeed));
}

class ScanOperator<T, R> implements Operator<T, R> {
  constructor(private accumulator: (acc: R, value: T, index: number) => R, private seed?: T | R, private hasSeed: boolean = false) {}

  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new ScanSubscriber(subscriber, this.accumulator, this.seed, this.hasSeed));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class ScanSubscriber<T, R> extends Subscriber<T> {
  private index: number = 0;

  get seed(): T | R {
    return this._seed;
  }

  set seed(value: T | R) {
    this.hasSeed = true;
    this._seed = value;
  }

  constructor(destination: Subscriber<R>, private accumulator: (acc: R, value: T, index: number) => R, private _seed: T | R,
              private hasSeed: boolean) {
    super(destination);
  }

  protected _next(value: T): void {
    if (!this.hasSeed) {
      this.seed = value;
      this.destination.next(value);
    } else {
      return this._tryNext(value);
    }
  }

  private _tryNext(value: T): void {
    const index = this.index++;
    let result: any;
    try {
      result = this.accumulator(<R>this.seed, value, index);
    } catch (err) {
      this.destination.error(err);
    }
    this.seed = result;
    this.destination.next(result);
  }
}
