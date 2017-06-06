import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Observer } from '../Observer';
import { Subscription } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { Subscribable } from '../Observable';
import { subscribeToResult } from '../util/subscribeToResult';

export function mergeAll<T>(this: Observable<T>, concurrent?: number): T;
export function mergeAll<T, R>(this: Observable<T>, concurrent?: number): Subscribable<R>;

/**
 * 将高阶 Observable 转换成一阶 Observable ，一阶 Observable 会同时发出在内部 
 * Observables 上发出的所有值。
 *
 * <span class="informal">打平高阶 Observable 。</span>
 *
 * <img src="./img/mergeAll.png" width="100%">
 *
 * `mergeAll` 订阅发出 Observables 的 Observalbe ，也称为高阶 Observable 。
 * 每当观察到发出的内部 Observable 时，它会订阅并发出输出 Observable 上的这个
 * 内部 Observable 的所有值。所有的内部 Observable 都完成了，输出 Observable 
 * 才能完成。任何由内部 Observable 发出的错误都会立即在输出 Observalbe 上发出。
 *
 * @example <caption>为每个点击事件创建一个新的 interval Observable ，并将其输出混合为一个 Observable</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var higherOrder = clicks.map((ev) => Rx.Observable.interval(1000));
 * var firstOrder = higherOrder.mergeAll();
 * firstOrder.subscribe(x => console.log(x));
 *
 * @example <caption>每次点击都会从0到9计数(每秒计数一次)，但只允许最多同时只能有两个计时器</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var higherOrder = clicks.map((ev) => Rx.Observable.interval(1000).take(10));
 * var firstOrder = higherOrder.mergeAll(2);
 * firstOrder.subscribe(x => console.log(x));
 *
 * @see {@link combineAll}
 * @see {@link concatAll}
 * @see {@link exhaust}
 * @see {@link merge}
 * @see {@link mergeMap}
 * @see {@link mergeMapTo}
 * @see {@link mergeScan}
 * @see {@link switch}
 * @see {@link zipAll}
 *
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] 可以同时订阅的输入 
 * Observables 的最大数量。
 * @return {Observable} 该 Observable 发出的值来自所有由源 Observable 发出的
 * 内部 Observables 。
 * @method mergeAll
 * @owner Observable
 */
export function mergeAll<T>(this: Observable<T>, concurrent: number = Number.POSITIVE_INFINITY): T {
  return <any>this.lift<any>(new MergeAllOperator<T>(concurrent));
}

export class MergeAllOperator<T> implements Operator<Observable<T>, T> {
  constructor(private concurrent: number) {
  }

  call(observer: Observer<T>, source: any): any {
    return source.subscribe(new MergeAllSubscriber(observer, this.concurrent));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class MergeAllSubscriber<T> extends OuterSubscriber<Observable<T>, T> {
  private hasCompleted: boolean = false;
  private buffer: Observable<T>[] = [];
  private active: number = 0;

  constructor(destination: Observer<T>, private concurrent: number) {
    super(destination);
  }

  protected _next(observable: Observable<T>) {
    if (this.active < this.concurrent) {
      this.active++;
      this.add(subscribeToResult<Observable<T>, T>(this, observable));
    } else {
      this.buffer.push(observable);
    }
  }

  protected _complete() {
    this.hasCompleted = true;
    if (this.active === 0 && this.buffer.length === 0) {
      this.destination.complete();
    }
  }

  notifyComplete(innerSub: Subscription) {
    const buffer = this.buffer;
    this.remove(innerSub);
    this.active--;
    if (buffer.length > 0) {
      this._next(buffer.shift());
    } else if (this.active === 0 && this.hasCompleted) {
      this.destination.complete();
    }
  }
}
