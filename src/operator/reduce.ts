import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';

/* tslint:disable:max-line-length */
export function reduce<T>(this: Observable<T>, accumulator: (acc: T[], value: T, index: number) => T[], seed: T[]): Observable<T[]>;
export function reduce<T>(this: Observable<T>, accumulator: (acc: T, value: T, index: number) => T, seed?: T): Observable<T>;
export function reduce<T, R>(this: Observable<T>, accumulator: (acc: R, value: T, index: number) => R, seed: R): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 在源 Observalbe 上应用 accumulator (累加器) 函数，然后当源 Observable 完成时，返回
 * 累加的结果，可以提供一个可选的 seed 值。
 *
 * <span class="informal">使用 accumulator (累加器) 函数将源 Observable 所发出的所有值归并在一起，
 * 该函数知道如何将新的源值纳入到过往的累加结果中。</span>
 *
 * <img src="./img/reduce.png" width="100%">
 *
 * 类似于 [Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)，
 * `reduce` 可以对累加值和源 Observable (过去的)的每个值应用 `accumulator` 函数，
 * 然后将其归并成一个值并且在输出 Observable 上发出。注意，`reduce` 只会发出一个值，
 * 并且是当源 Observable 完成时才发出。它等价于使用 {@link scan} 操作符后面再跟
 * {@link last} 操作符。
 *
 * 返回的 Observable 为由源 Observable 发出的每项应用指定的 `accumulator` 函数。
 * 如果指定了 `seed` 值，那么这个值会作为 `accumulator` 函数的初始值。如果没有指定
 * `seed` 值，那么源中的第一项会作为 `seed` 来使用。
 *
 * @example <caption>计算5秒内发生的点击次数</caption>
 * var clicksInFiveSeconds = Rx.Observable.fromEvent(document, 'click')
 *   .takeUntil(Rx.Observable.interval(5000));
 * var ones = clicksInFiveSeconds.mapTo(1);
 * var seed = 0;
 * var count = ones.reduce((acc, one) => acc + one, seed);
 * count.subscribe(x => console.log(x));
 *
 * @see {@link count}
 * @see {@link expand}
 * @see {@link mergeScan}
 * @see {@link scan}
 *
 * @param {function(acc: R, value: T, index: number): R} accumulator 调用每个
 * 源值的累加器函数。
 * @param {R} [seed] 初始累加值。
 * @return {Observable<R>} 该 Observable 发出单个值，这个值是由源 Observable 
 * 发出值累加的结果。
 * @method reduce
 * @owner Observable
 */
export function reduce<T, R>(this: Observable<T>, accumulator: (acc: R, value: T, index?: number) => R, seed?: R): Observable<R> {
  let hasSeed = false;
  // providing a seed of `undefined` *should* be valid and trigger
  // hasSeed! so don't use `seed !== undefined` checks!
  // For this reason, we have to check it here at the original call site
  // otherwise inside Operator/Subscriber we won't know if `undefined`
  // means they didn't provide anything or if they literally provided `undefined`
  if (arguments.length >= 2) {
    hasSeed = true;
  }

  return this.lift(new ReduceOperator(accumulator, seed, hasSeed));
}

export class ReduceOperator<T, R> implements Operator<T, R> {
  constructor(private accumulator: (acc: R, value: T, index?: number) => R, private seed?: R, private hasSeed: boolean = false) {}

  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new ReduceSubscriber(subscriber, this.accumulator, this.seed, this.hasSeed));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class ReduceSubscriber<T, R> extends Subscriber<T> {
  private index: number = 0;
  private acc: T | R;
  private hasValue: boolean = false;

  constructor(destination: Subscriber<R>,
              private accumulator: (acc: R, value: T, index?: number) => R,
              seed: R,
              private hasSeed: boolean) {
    super(destination);
    this.acc = seed;

    if (!this.hasSeed) {
      this.index++;
    }
  }

  protected _next(value: T) {
    if (this.hasValue || (this.hasValue = this.hasSeed)) {
      this._tryReduce(value);
    } else {
      this.acc = value;
      this.hasValue = true;
    }
  }

  private _tryReduce(value: T) {
    let result: any;
    try {
      result = this.accumulator(<R>this.acc, value, this.index++);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.acc = result;
  }

  protected _complete() {
    if (this.hasValue || this.hasSeed) {
      this.destination.next(this.acc);
    }
    this.destination.complete();
  }
}
