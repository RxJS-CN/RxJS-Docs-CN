import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subject } from '../Subject';

import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 当 `windowBoundaries` 开始发送时，分支源 Observable 的值作为嵌套 Observable。
 *
 * <span class="informal">就像是 {@link buffer}, 但是发出嵌套 Observable 而不是数组。</span>
 *
 * <img src="./img/window.png" width="100%">
 *
 * 返回一个发出从源 Observable 收集到数据的 window Observable。 输出 Observable 发出连接的，不重叠的 
 * windows. 它会发出目前的 window 并且会打开一个新的当`windowBoundaries` Observable开始发出数据。 
 * 因为每个 window 都是 Observable， 所以输出 Observable 是高阶 Observable。
 *
 * @example <caption>在每个1秒的 window , 发出最近的两次点击事件</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var interval = Rx.Observable.interval(1000);
 * var result = clicks.window(interval)
 *   .map(win => win.take(2)) // each window has at most 2 emissions
 *   .mergeAll(); // flatten the Observable-of-Observables
 * result.subscribe(x => console.log(x));
 *
 * @see {@link windowCount}
 * @see {@link windowTime}
 * @see {@link windowToggle}
 * @see {@link windowWhen}
 * @see {@link buffer}
 *
 * @param {Observable<any>} windowBoundaries 完成上一个 window 并且开启新 window 的 Observable。
 * @return {Observable<Observable<T>>} 有很多 windows 的 Observable, 它们是 Observables 发出源
 * Observables 的值。
 * @method window
 * @owner Observable
 */
export function window<T>(this: Observable<T>, windowBoundaries: Observable<any>): Observable<Observable<T>> {
  return this.lift(new WindowOperator<T>(windowBoundaries));
}

class WindowOperator<T> implements Operator<T, Observable<T>> {

  constructor(private windowBoundaries: Observable<any>) {
  }

  call(subscriber: Subscriber<Observable<T>>, source: any): any {
    const windowSubscriber = new WindowSubscriber(subscriber);
    const sourceSubscription = source.subscribe(windowSubscriber);
    if (!sourceSubscription.closed) {
      windowSubscriber.add(subscribeToResult(windowSubscriber, this.windowBoundaries));
    }
    return sourceSubscription;
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class WindowSubscriber<T> extends OuterSubscriber<T, any> {

  private window: Subject<T> = new Subject<T>();

  constructor(destination: Subscriber<Observable<T>>) {
    super(destination);
    destination.next(this.window);
  }

  notifyNext(outerValue: T, innerValue: any,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, any>): void {
    this.openWindow();
  }

  notifyError(error: any, innerSub: InnerSubscriber<T, any>): void {
    this._error(error);
  }

  notifyComplete(innerSub: InnerSubscriber<T, any>): void {
    this._complete();
  }

  protected _next(value: T): void {
    this.window.next(value);
  }

  protected _error(err: any): void {
    this.window.error(err);
    this.destination.error(err);
  }

  protected _complete(): void {
    this.window.complete();
    this.destination.complete();
  }

  protected _unsubscribe() {
    this.window = null;
  }

  private openWindow(): void  {
    const prevWindow = this.window;
    if (prevWindow) {
      prevWindow.complete();
    }
    const destination = this.destination;
    const newWindow = this.window = new Subject<T>();
    destination.next(newWindow);
  }
}
