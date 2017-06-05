import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { Subscription } from '../Subscription';

import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';

import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 分支源 Observable 的值作为嵌套 Observable，使用工厂函数返回的关闭 Observables 来决定何时开启新的 window。
 *
 * <span class="informal">就像是 {@link bufferWhen}, 但是发出的是嵌套的 Observable
 * 而不是数组。</span>
 *
 * <img src="./img/windowWhen.png" width="100%">
 *
 * 返回一个发出从源 Observable 收集到数据的 window Observable。 输出 Observable 发出连接的，非重叠的 windows。
 * 它释放当前 window 并且打开新的 window 当由指定 `closingSelector` 函数返回的 Observable
 * 发出数据时。当输出 Observable 被订阅的时候立马开启第一个 window。
 *
 * @example <caption>仅仅发出前两个点击事件在每个 window 的[1-5]随机秒数</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks
 *   .windowWhen(() => Rx.Observable.interval(1000 + Math.random() * 4000))
 *   .map(win => win.take(2)) // each window has at most 2 emissions
 *   .mergeAll(); // flatten the Observable-of-Observables
 * result.subscribe(x => console.log(x));
 *
 * @see {@link window}
 * @see {@link windowCount}
 * @see {@link windowTime}
 * @see {@link windowToggle}
 * @see {@link bufferWhen}
 *
 * @param {function(): Observable} closingSelector 函数，不接受参数并且返回 Observable，
 * 该 Observable 发出信号(`next` 或者 `complete`)决定何时关闭前一个 window ，开启新一个 window。
 * @return {Observable<Observable<T>>} 返回 windows 的 observable, 它反过来又是 Observables。
 * @method windowWhen
 * @owner Observable
 */
export function windowWhen<T>(this: Observable<T>, closingSelector: () => Observable<any>): Observable<Observable<T>> {
  return this.lift(new WindowOperator<T>(closingSelector));
}

class WindowOperator<T> implements Operator<T, Observable<T>> {
  constructor(private closingSelector: () => Observable<any>) {
  }

  call(subscriber: Subscriber<Observable<T>>, source: any): any {
    return source.subscribe(new WindowSubscriber(subscriber, this.closingSelector));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class WindowSubscriber<T> extends OuterSubscriber<T, any> {
  private window: Subject<T>;
  private closingNotification: Subscription;

  constructor(protected destination: Subscriber<Observable<T>>,
              private closingSelector: () => Observable<any>) {
    super(destination);
    this.openWindow();
  }

  notifyNext(outerValue: T, innerValue: any,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, any>): void {
    this.openWindow(innerSub);
  }

  notifyError(error: any, innerSub: InnerSubscriber<T, any>): void {
    this._error(error);
  }

  notifyComplete(innerSub: InnerSubscriber<T, any>): void {
    this.openWindow(innerSub);
  }

  protected _next(value: T): void {
    this.window.next(value);
  }

  protected _error(err: any): void {
    this.window.error(err);
    this.destination.error(err);
    this.unsubscribeClosingNotification();
  }

  protected _complete(): void {
    this.window.complete();
    this.destination.complete();
    this.unsubscribeClosingNotification();
  }

  private unsubscribeClosingNotification(): void {
    if (this.closingNotification) {
      this.closingNotification.unsubscribe();
    }
  }

  private openWindow(innerSub: InnerSubscriber<T, any> = null): void {
    if (innerSub) {
      this.remove(innerSub);
      innerSub.unsubscribe();
    }

    const prevWindow = this.window;
    if (prevWindow) {
      prevWindow.complete();
    }

    const window = this.window = new Subject<T>();
    this.destination.next(window);

    const closingNotifier = tryCatch(this.closingSelector)();
    if (closingNotifier === errorObject) {
      const err = errorObject.e;
      this.destination.error(err);
      this.window.error(err);
    } else {
      this.add(this.closingNotification = subscribeToResult(this, closingNotifier));
    }
  }
}
