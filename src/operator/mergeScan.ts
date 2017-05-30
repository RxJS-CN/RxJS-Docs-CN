import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { subscribeToResult } from '../util/subscribeToResult';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';

/**
 * 在源 Observable 上应用 accumulator 函数，其中 accumulator 函数本身返回 
 * Observable ，然后每个返回的中间 Observable 会被合并到输出 Observable 中。
 *
 * <span class="informal">它很像 {@link scan}，但 accumulator 函数返回的 
 * Observables 会被合并到外部 Observalbe 中。</span>
 *
 * @example <caption>点击计数</caption>
 * const click$ = Rx.Observable.fromEvent(document, 'click');
 * const one$ = click$.mapTo(1);
 * const seed = 0;
 * const count$ = one$.mergeScan((acc, one) => Rx.Observable.of(acc + one), seed);
 * count$.subscribe(x => console.log(x));
 *
 * // 结果：
 * 1
 * 2
 * 3
 * 4
 * // ...以此类推，每次点击计数增加1
 *
 * @param {function(acc: R, value: T): Observable<R>} accumulator
 * 在每个源值上调用的累加器函数。
 * @param seed 初始的累加值。
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] 可以同时订阅的输入 
 * Observables 的最大数量。
 * @return {Observable<R>} 累加值的 Observable 。
 * @method mergeScan
 * @owner Observable
 */
export function mergeScan<T, R>(this: Observable<T>,
                                accumulator: (acc: R, value: T) => Observable<R>,
                                seed: R,
                                concurrent: number = Number.POSITIVE_INFINITY): Observable<R> {
  return this.lift(new MergeScanOperator(accumulator, seed, concurrent));
}

export class MergeScanOperator<T, R> implements Operator<T, R> {
  constructor(private accumulator: (acc: R, value: T) => Observable<R>,
              private seed: R,
              private concurrent: number) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new MergeScanSubscriber(
      subscriber, this.accumulator, this.seed, this.concurrent
    ));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class MergeScanSubscriber<T, R> extends OuterSubscriber<T, R> {
  private hasValue: boolean = false;
  private hasCompleted: boolean = false;
  private buffer: Observable<any>[] = [];
  private active: number = 0;
  protected index: number = 0;

  constructor(destination: Subscriber<R>,
              private accumulator: (acc: R, value: T) => Observable<R>,
              private acc: R,
              private concurrent: number) {
    super(destination);
  }

  protected _next(value: any): void {
    if (this.active < this.concurrent) {
      const index = this.index++;
      const ish = tryCatch(this.accumulator)(this.acc, value);
      const destination = this.destination;
      if (ish === errorObject) {
        destination.error(errorObject.e);
      } else {
        this.active++;
        this._innerSub(ish, value, index);
      }
    } else {
      this.buffer.push(value);
    }
  }

  private _innerSub(ish: any, value: T, index: number): void {
    this.add(subscribeToResult<T, R>(this, ish, value, index));
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (this.active === 0 && this.buffer.length === 0) {
      if (this.hasValue === false) {
        this.destination.next(this.acc);
      }
      this.destination.complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    const { destination } = this;
    this.acc = innerValue;
    this.hasValue = true;
    destination.next(innerValue);
  }

  notifyComplete(innerSub: Subscription): void {
    const buffer = this.buffer;
    this.remove(innerSub);
    this.active--;
    if (buffer.length > 0) {
      this._next(buffer.shift());
    } else if (this.active === 0 && this.hasCompleted) {
      if (this.hasValue === false) {
        this.destination.next(this.acc);
      }
      this.destination.complete();
    }
  }
}
