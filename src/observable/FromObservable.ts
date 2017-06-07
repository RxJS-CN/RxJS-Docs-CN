import { isArray } from '../util/isArray';
import { isArrayLike } from '../util/isArrayLike';
import { isPromise } from '../util/isPromise';
import { PromiseObservable } from './PromiseObservable';
import { IteratorObservable } from'./IteratorObservable';
import { ArrayObservable } from './ArrayObservable';
import { ArrayLikeObservable } from './ArrayLikeObservable';

import { IScheduler } from '../Scheduler';
import { iterator as Symbol_iterator } from '../symbol/iterator';
import { Observable, ObservableInput } from '../Observable';
import { Subscriber } from '../Subscriber';
import { ObserveOnSubscriber } from '../operator/observeOn';
import { observable as Symbol_observable } from '../symbol/observable';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class FromObservable<T> extends Observable<T> {
  constructor(private ish: ObservableInput<T>, private scheduler?: IScheduler) {
    super(null);
  }

  static create<T>(ish: ObservableInput<T>, scheduler?: IScheduler): Observable<T>;
  static create<T, R>(ish: ArrayLike<T>, scheduler?: IScheduler): Observable<R>;

  /**
   * 从一个数组、类数组对象、Promise、迭代器对象或者类 Observable 对象创建一个 Observable.
   *
   * <span class="informal">几乎可以把任何东西都能转化为Observable.</span>
   *
   * <img src="./img/from.png" width="100%">
   *
   * 将各种其他对象和数据类型转化为 Observables。 `from`将 Promise、类数组对象、迭代器对象
   * (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable)
   * 转化为 Observable ，该 Observable 发出 promise、数组或者迭代器的成员。 字符串，在这种上下文里，会被当做字符数组。
   * 类 Observable 对象(包括ES2015里的 Observable 方法)也可以通过此操作符进行转换。
   *
   * @example <caption>将数组转化为 Observable</caption>
   * var array = [10, 20, 30];
   * var result = Rx.Observable.from(array);
   * result.subscribe(x => console.log(x));
   *
   * // 结果如下:
   * // 10 20 30
   *
   * @example <caption>将一个无限的迭代器(来自于 generator)转化为 Observable。</caption>
   * function* generateDoubles(seed) {
   *   var i = seed;
   *   while (true) {
   *     yield i;
   *     i = 2 * i; // double it
   *   }
   * }
   *
   * var iterator = generateDoubles(3);
   * var result = Rx.Observable.from(iterator).take(10);
   * result.subscribe(x => console.log(x));
   *
   * // Results in the following:
   * // 3 6 12 24 48 96 192 384 768 1536
   *
   * @see {@link create}
   * @see {@link fromEvent}
   * @see {@link fromEventPattern}
   * @see {@link fromPromise}
   *
   * @param {ObservableInput<T>} ish 一个可以被订阅的对象, Promise, 类
   * Observable, 数组, 迭代器或者类数组对象可以被转化。
   * @param {Scheduler} [scheduler] 调度器，用来调度值的发送。
   * @return {Observable<T>} Observable的值来自于输入对象的转化。
   * @static true
   * @name from
   * @owner Observable
   */
  static create<T>(ish: ObservableInput<T>, scheduler?: IScheduler): Observable<T> {
    if (ish != null) {
      if (typeof ish[Symbol_observable] === 'function') {
        if (ish instanceof Observable && !scheduler) {
          return ish;
        }
        return new FromObservable<T>(ish, scheduler);
      } else if (isArray(ish)) {
        return new ArrayObservable<T>(ish, scheduler);
      } else if (isPromise(ish)) {
        return new PromiseObservable<T>(ish, scheduler);
      } else if (typeof ish[Symbol_iterator] === 'function' || typeof ish === 'string') {
        return new IteratorObservable<T>(ish, scheduler);
      } else if (isArrayLike(ish)) {
        return new ArrayLikeObservable(ish, scheduler);
      }
    }

    throw new TypeError((ish !== null && typeof ish || ish) + ' is not observable');
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    const ish = this.ish;
    const scheduler = this.scheduler;
    if (scheduler == null) {
      return ish[Symbol_observable]().subscribe(subscriber);
    } else {
      return ish[Symbol_observable]().subscribe(new ObserveOnSubscriber(subscriber, scheduler, 0));
    }
  }
}
