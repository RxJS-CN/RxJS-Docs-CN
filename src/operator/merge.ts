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
 * 创建一个并行发出所有输入Observable值的输出Observable.
 *
 * <span class="informal">将多个Observables合并通过混合它们的值到一个Observable.</span>
 *
 * <img src="./img/merge.png" width="100%">
 *
 * `merge` 订阅每个输入Observable (either the source or an
 * Observable given as argument), 然后将所有输入Observables的值简单(不做任何的转变)的传递
 * 给输出Observable. 输出Observable只有所有的输入都完成了才会触发完成状态. 任一输入Observable
 * 发生错误，都会立马触发输出Observable的错误状态.
 *
 * @example <caption>合并两个Observables: 1s间隔和点击</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var timer = Rx.Observable.interval(1000);
 * var clicksOrTimer = clicks.merge(timer);
 * clicksOrTimer.subscribe(x => console.log(x));
 *
 * @example <caption>合并3个Observables, 但是只并行运行2个</caption>
 * var timer1 = Rx.Observable.interval(1000).take(10);
 * var timer2 = Rx.Observable.interval(2000).take(6);
 * var timer3 = Rx.Observable.interval(500).take(10);
 * var concurrent = 2; // the argument
 * var merged = timer1.merge(timer2, timer3, concurrent);
 * merged.subscribe(x => console.log(x));
 *
 * @see {@link mergeAll}
 * @see {@link mergeMap}
 * @see {@link mergeMapTo}
 * @see {@link mergeScan}
 *
 * @param {ObservableInput} other 输入Observable和源Observable进行合并. 可以传递多个Observables做为参数.
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] 输入Observables的最大并行数.
 * @param {Scheduler} [scheduler=null] 调度器用来管理输入Observables的并行数.
 * @return {Observable} 一个发出值为所有输入Observable的值的Observable.
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
 * 创建一个输出 Observable ，它可以同时发出每个给定的输入 Observable 中值。
 *
 * <span class="informal">通过把多个 Observables 的值混合到一个 Observable 中来将其打平。</span>
 *
 * <img src="./img/merge.png" width="100%">
 *
 * `merge` 订阅每个给定的输入 Observable (作为参数)，然后只是将所有输入 Observables 的所有值发
 * 送(不进行任何转换)到输出 Observable 。所有的输入 Observable 都完成了，输出 Observable 才
 * 能完成。任何由输入 Observable 发出的错误都会立即在输出 Observalbe 上发出。
 *
 * @example <caption>合并两个 Observables: 时间间隔为1秒的 timer 和 clicks</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var timer = Rx.Observable.interval(1000);
 * var clicksOrTimer = Rx.Observable.merge(clicks, timer);
 * clicksOrTimer.subscribe(x => console.log(x));
 *
 * // 结果如下:
 * // 每隔1s发出一个自增值到控制台
 * // document被点击的时候MouseEvents会被打印到控制台
 * // 因为两个流被合并了，所以你当它们发生的时候你就可以看见.
 *
 * @example <caption>合并3个Observables, 但是只并行运行2个</caption>
 * var timer1 = Rx.Observable.interval(1000).take(10);
 * var timer2 = Rx.Observable.interval(2000).take(6);
 * var timer3 = Rx.Observable.interval(500).take(10);
 * var concurrent = 2; // the argument
 * var merged = Rx.Observable.merge(timer1, timer2, timer3, concurrent);
 * merged.subscribe(x => console.log(x));
 *
 * // 结果如下:
 * // - timer1和timer2将会并行运算
 * // - timer1每隔1s发出值，迭代10次
 * // - timer2每隔1s发出值，迭代6次
 * // - timer1达到迭代最大次数,timer2会继续，timer3开始和timer2并行运行
 * // - 当timer2达到最大迭代次数就停止，timer3将会继续每隔500ms发出数据直到结束
 *
 * @see {@link mergeAll}
 * @see {@link mergeMap}
 * @see {@link mergeMapTo}
 * @see {@link mergeScan}
 *
 * @param {...ObservableInput} observables 合并到一起的输入Observables。
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] 可以同时订阅的输入 Observables 的最大数量。
 * @param {Scheduler} [scheduler=null] 调度器用来管理并行的输入Observables。
 * @return {Observable} 该 Observable 发出的项是每个输入 Observable 的结果。
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
