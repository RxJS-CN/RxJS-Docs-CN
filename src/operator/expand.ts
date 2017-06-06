import { Observable } from '../Observable';
import { IScheduler } from '../Scheduler';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { Subscription } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/* tslint:disable:max-line-length */
export function expand<T>(this: Observable<T>, project: (value: T, index: number) => Observable<T>, concurrent?: number, scheduler?: IScheduler): Observable<T>;
export function expand<T, R>(this: Observable<T>, project: (value: T, index: number) => Observable<R>, concurrent?: number, scheduler?: IScheduler): Observable<R>;
/* tslint:enable:max-line-length */

/**
 * 递归地将每个源值投射成 Observable，这个 Observable 会被合并到输出 Observable 中。
 *
 * <span class="informal">它与 {@link mergeMap} 类似，但将投射函数应用于每个源值
 * 以及每个输出值。它是递归的。</span>
 *
 * <img src="./img/expand.png" width="100%">
 *
 * 返回的 Observable 基于应用一个函数来发送项，该函数提供给源 Observable 发出的每个项，
 * 并返回一个 Observable，然后合并这些作为结果的 Observable，并发出本次合并的结果。
 * `expand` 会重新发出在输出 Observable 上的每个源值。然后，将每个输出值传给投射函数，
 * 该函数返回要合并到输出 Observable 上的内部 Observable 。由投影产生的那些输出值也会
 * 被传给投射函数以产生新的输出值。这就是 `expand` 如何进行递归的。
 *
 * @example <caption>每次点击开始发出的值都是乘以2的，最多连乘10次</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var powersOfTwo = clicks
 *   .mapTo(1)
 *   .expand(x => Rx.Observable.of(2 * x).delay(1000))
 *   .take(10);
 * powersOfTwo.subscribe(x => console.log(x));
 *
 * @see {@link mergeMap}
 * @see {@link mergeScan}
 *
 * @param {function(value: T, index: number) => Observable} project 函数，
 * 当应用于源 Observable 或输出 Observable 发出的项时，返回一个 Observable 。
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] 同时订阅输入 
 * Observables 的最大数量。
 * @return {Observable} Observable 发出源值，同时也将投影函数应用于在输出 Observable 上
 * 发出的每个值以得到结果，然后合并这些从转换后得到的 Observables 的结果。
 * @method expand
 * @owner Observable
 */
export function expand<T, R>(this: Observable<T>, project: (value: T, index: number) => Observable<R>,
                             concurrent: number = Number.POSITIVE_INFINITY,
                             scheduler: IScheduler = undefined): Observable<R> {
  concurrent = (concurrent || 0) < 1 ? Number.POSITIVE_INFINITY : concurrent;

  return this.lift(new ExpandOperator(project, concurrent, scheduler));
}

export class ExpandOperator<T, R> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => Observable<R>,
              private concurrent: number,
              private scheduler: IScheduler) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new ExpandSubscriber(subscriber, this.project, this.concurrent, this.scheduler));
  }
}

interface DispatchArg<T, R> {
  subscriber: ExpandSubscriber<T, R>;
  result: Observable<R>;
  value: any;
  index: number;
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class ExpandSubscriber<T, R> extends OuterSubscriber<T, R> {
  private index: number = 0;
  private active: number = 0;
  private hasCompleted: boolean = false;
  private buffer: any[];

  constructor(destination: Subscriber<R>,
              private project: (value: T, index: number) => Observable<R>,
              private concurrent: number,
              private scheduler: IScheduler) {
    super(destination);
    if (concurrent < Number.POSITIVE_INFINITY) {
      this.buffer = [];
    }
  }

  private static dispatch<T, R>(arg: DispatchArg<T, R>): void {
    const {subscriber, result, value, index} = arg;
    subscriber.subscribeToProjection(result, value, index);
  }

  protected _next(value: any): void {
    const destination = this.destination;

    if (destination.closed) {
      this._complete();
      return;
    }

    const index = this.index++;
    if (this.active < this.concurrent) {
      destination.next(value);
      let result = tryCatch(this.project)(value, index);
      if (result === errorObject) {
        destination.error(errorObject.e);
      } else if (!this.scheduler) {
        this.subscribeToProjection(result, value, index);
      } else {
        const state: DispatchArg<T, R> = { subscriber: this, result, value, index };
        this.add(this.scheduler.schedule(ExpandSubscriber.dispatch, 0, state));
      }
    } else {
      this.buffer.push(value);
    }
  }

  private subscribeToProjection(result: any, value: T, index: number): void {
    this.active++;
    this.add(subscribeToResult<T, R>(this, result, value, index));
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this._next(innerValue);
  }

  notifyComplete(innerSub: Subscription): void {
    const buffer = this.buffer;
    this.remove(innerSub);
    this.active--;
    if (buffer && buffer.length > 0) {
      this._next(buffer.shift());
    }
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  }
}
