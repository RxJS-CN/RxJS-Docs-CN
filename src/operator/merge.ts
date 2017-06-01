import { Observable, ObservableInput } from '../Observable';
import { IScheduler } from '../Scheduler';
import { ArrayObservable } from '../observable/ArrayObservable';
import { MergeAllOperator } from './mergeAll';
import { isScheduler } from '../util/isScheduler';

/* tslint:disable:max-line-length */
export function merge<T>(this: Observable<T>, scheduler?: IScheduler): Observable<T>;
export function merge<T>(this: Observable<T>, concurrent?: number, scheduler?: IScheduler): Observable<T>;
export function merge<T, T2>(this: Observable<T>, v2: ObservableInput<T2>, scheduler?: IScheduler): Observable<T | T2>;
export function merge<T, T2>(this: Observable<T>, v2: ObservableInput<T2>, concurrent?: number, scheduler?: IScheduler): Observable<T | T2>;
export function merge<T, T2, T3>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: IScheduler): Observable<T | T2 | T3>;
export function merge<T, T2, T3>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, concurrent?: number, scheduler?: IScheduler): Observable<T | T2 | T3>;
export function merge<T, T2, T3, T4>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: IScheduler): Observable<T | T2 | T3 | T4>;
export function merge<T, T2, T3, T4>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, concurrent?: number, scheduler?: IScheduler): Observable<T | T2 | T3 | T4>;
export function merge<T, T2, T3, T4, T5>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: IScheduler): Observable<T | T2 | T3 | T4 | T5>;
export function merge<T, T2, T3, T4, T5>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, concurrent?: number, scheduler?: IScheduler): Observable<T | T2 | T3 | T4 | T5>;
export function merge<T, T2, T3, T4, T5, T6>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: IScheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
export function merge<T, T2, T3, T4, T5, T6>(this: Observable<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, concurrent?: number, scheduler?: IScheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
export function merge<T>(this: Observable<T>, ...observables: Array<ObservableInput<T> | IScheduler | number>): Observable<T>;
export function merge<T, R>(this: Observable<T>, ...observables: Array<ObservableInput<any> | IScheduler | number>): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 创建一个输出 Observable ，它可以同时发出每个给定的输入 Observable 中所有值。
 *
 * <span class="informal">通过把多个 Observables 的值混合到一个 Observable 中
 * 来将其打平。</span>
 *
 * <img src="./img/merge.png" width="100%">
 *
 * `merge` 订阅每个给定的输入 Observable (给定的源或作为参数的 Observable )，然后只是
 * 将所有输入 Observables 的所有值发送(不进行任何转换)到输出 Observable 。所有的输入 
 * Observable 都完成了，输出 Observable 才能完成。任何由输入 Observable 发出的错误都
 * 会立即在输出 Observalbe 上发出。
 *
 * @example <caption>合并两个 Observables: 时间间隔为1秒的 timer 和 clicks</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var timer = Rx.Observable.interval(1000);
 * var clicksOrTimer = clicks.merge(timer);
 * clicksOrTimer.subscribe(x => console.log(x));
 *
 * @example <caption>合并三个 Observables ，但只能同时运行两个</caption>
 * var timer1 = Rx.Observable.interval(1000).take(10);
 * var timer2 = Rx.Observable.interval(2000).take(6);
 * var timer3 = Rx.Observable.interval(500).take(10);
 * var concurrent = 2; // 参数
 * var merged = timer1.merge(timer2, timer3, concurrent);
 * merged.subscribe(x => console.log(x));
 *
 * @see {@link mergeAll}
 * @see {@link mergeMap}
 * @see {@link mergeMapTo}
 * @see {@link mergeScan}
 *
 * @param {ObservableInput} other 可以与源 Observable 合并的输入 Observable 。
 * 可以给定多个输入 Observables 作为参数。
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] 可以同时订阅的输入 
 * Observables 的最大数量。
 * @param {Scheduler} [scheduler=null] 用来管理输入 Observables 的并发性的
 * 调度器。
 * @return {Observable} 该 Observable 发出的项是每个输入 Observable 的结果。
 * @method merge
 * @owner Observable
 */
export function merge<T, R>(this: Observable<T>, ...observables: Array<ObservableInput<any> | IScheduler | number>): Observable<R> {
  return this.lift.call(mergeStatic<T, R>(this, ...observables));
}

/* tslint:disable:max-line-length */
export function mergeStatic<T>(v1: ObservableInput<T>, scheduler?: IScheduler): Observable<T>;
export function mergeStatic<T>(v1: ObservableInput<T>, concurrent?: number, scheduler?: IScheduler): Observable<T>;
export function mergeStatic<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, scheduler?: IScheduler): Observable<T | T2>;
export function mergeStatic<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, concurrent?: number, scheduler?: IScheduler): Observable<T | T2>;
export function mergeStatic<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: IScheduler): Observable<T | T2 | T3>;
export function mergeStatic<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, concurrent?: number, scheduler?: IScheduler): Observable<T | T2 | T3>;
export function mergeStatic<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: IScheduler): Observable<T | T2 | T3 | T4>;
export function mergeStatic<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, concurrent?: number, scheduler?: IScheduler): Observable<T | T2 | T3 | T4>;
export function mergeStatic<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: IScheduler): Observable<T | T2 | T3 | T4 | T5>;
export function mergeStatic<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, concurrent?: number, scheduler?: IScheduler): Observable<T | T2 | T3 | T4 | T5>;
export function mergeStatic<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: IScheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
export function mergeStatic<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, concurrent?: number, scheduler?: IScheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
export function mergeStatic<T>(...observables: (ObservableInput<T> | IScheduler | number)[]): Observable<T>;
export function mergeStatic<T, R>(...observables: (ObservableInput<any> | IScheduler | number)[]): Observable<R>;
/* tslint:enable:max-line-length */
/**
 * Creates an output Observable which concurrently emits all values from every
 * given input Observable.
 *
 * <span class="informal">Flattens multiple Observables together by blending
 * their values into one Observable.</span>
 *
 * <img src="./img/merge.png" width="100%">
 *
 * `merge` subscribes to each given input Observable (as arguments), and simply
 * forwards (without doing any transformation) all the values from all the input
 * Observables to the output Observable. The output Observable only completes
 * once all input Observables have completed. Any error delivered by an input
 * Observable will be immediately emitted on the output Observable.
 *
 * @example <caption>Merge together two Observables: 1s interval and clicks</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var timer = Rx.Observable.interval(1000);
 * var clicksOrTimer = Rx.Observable.merge(clicks, timer);
 * clicksOrTimer.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // timer will emit ascending values, one every second(1000ms) to console
 * // clicks logs MouseEvents to console everytime the "document" is clicked
 * // Since the two streams are merged you see these happening
 * // as they occur.
 *
 * @example <caption>Merge together 3 Observables, but only 2 run concurrently</caption>
 * var timer1 = Rx.Observable.interval(1000).take(10);
 * var timer2 = Rx.Observable.interval(2000).take(6);
 * var timer3 = Rx.Observable.interval(500).take(10);
 * var concurrent = 2; // the argument
 * var merged = Rx.Observable.merge(timer1, timer2, timer3, concurrent);
 * merged.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // - First timer1 and timer2 will run concurrently
 * // - timer1 will emit a value every 1000ms for 10 iterations
 * // - timer2 will emit a value every 2000ms for 6 iterations
 * // - after timer1 hits it's max iteration, timer2 will
 * //   continue, and timer3 will start to run concurrently with timer2
 * // - when timer2 hits it's max iteration it terminates, and
 * //   timer3 will continue to emit a value every 500ms until it is complete
 *
 * @see {@link mergeAll}
 * @see {@link mergeMap}
 * @see {@link mergeMapTo}
 * @see {@link mergeScan}
 *
 * @param {...ObservableInput} observables Input Observables to merge together.
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input
 * Observables being subscribed to concurrently.
 * @param {Scheduler} [scheduler=null] The IScheduler to use for managing
 * concurrency of input Observables.
 * @return {Observable} an Observable that emits items that are the result of
 * every input Observable.
 * @static true
 * @name merge
 * @owner Observable
 */
export function mergeStatic<T, R>(...observables: Array<ObservableInput<any> | IScheduler | number>): Observable<R> {
 let concurrent = Number.POSITIVE_INFINITY;
 let scheduler: IScheduler = null;
  let last: any = observables[observables.length - 1];
  if (isScheduler(last)) {
    scheduler = <IScheduler>observables.pop();
    if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {
      concurrent = <number>observables.pop();
    }
  } else if (typeof last === 'number') {
    concurrent = <number>observables.pop();
  }

  if (scheduler === null && observables.length === 1 && observables[0] instanceof Observable) {
    return <Observable<R>>observables[0];
  }

  return new ArrayObservable(<any>observables, scheduler).lift(new MergeAllOperator<R>(concurrent));
}
