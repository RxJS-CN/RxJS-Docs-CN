import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subject } from '../Subject';

/**
 * 将源 Observable 的值分支成多个嵌套的 Observable ，每个嵌套的 Observable 最多发出 windowSize 个值。
 *
 * <span class="informal">就像是 {@link bufferCount}, 但是返回嵌套的 Observable 而不是数组。</span>
 *
 * <img src="./img/windowCount.png" width="100%">

 * 返回的 Observable 发出从源 Observable 收集到的项的窗口。
 * 输出 Observable 每M(M = startWindowEvery)个项发出新窗口，每个窗口包含的项数不得超过N个(N = windowSize)。
 * 当源 Observable 完成或者遇到错误,输出 Observable 发出当前窗口并且传播从源 Observable 收到的通知。 
 * 如果没有提供 startWindowEvery ，那么在源 Observable 的起始处立即开启新窗口，并且当每个窗口的大小达到 windowSize 时完成。
 *
 * @example <caption>从第一个点击事件开始，忽略第3N次点击</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.windowCount(3)
 *   .map(win => win.skip(1)) // 跳过每三个点击中的第一个
 *   .mergeAll(); // 打平高阶 Observable
 * result.subscribe(x => console.log(x));
 *
 * @example <caption>从第三个点击事件开始，忽略第3N次点击</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.windowCount(2, 3)
 *   .mergeAll(); // 打平高阶 Observable
 * result.subscribe(x => console.log(x));
 *
 * @see {@link window}
 * @see {@link windowTime}
 * @see {@link windowToggle}
 * @see {@link windowWhen}
 * @see {@link bufferCount}
 *
 * @param {number} windowSize 每个窗口最多可以发送的个数。
 * @param {number} [startWindowEvery] 开启新窗口的间隔。
 * 比如，如果 `startWindowEvery` 是 `2`, 新窗口会在源中每个第二个值开启。默认情况下，新窗口是在源 Observable 的起始处开启的。
 * @return {Observable<Observable<T>>} 窗口的 Observable，每个窗口又是值的 Observable 。(译者注：其实就是高阶 Observable )
 * @method windowCount
 * @owner Observable
 */
export function windowCount<T>(this: Observable<T>, windowSize: number,
                               startWindowEvery: number = 0): Observable<Observable<T>> {
  return this.lift(new WindowCountOperator<T>(windowSize, startWindowEvery));
}

class WindowCountOperator<T> implements Operator<T, Observable<T>> {

  constructor(private windowSize: number,
              private startWindowEvery: number) {
  }

  call(subscriber: Subscriber<Observable<T>>, source: any): any {
    return source.subscribe(new WindowCountSubscriber(subscriber, this.windowSize, this.startWindowEvery));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class WindowCountSubscriber<T> extends Subscriber<T> {
  private windows: Subject<T>[] = [ new Subject<T>() ];
  private count: number = 0;

  constructor(protected destination: Subscriber<Observable<T>>,
              private windowSize: number,
              private startWindowEvery: number) {
    super(destination);
    destination.next(this.windows[0]);
  }

  protected _next(value: T) {
    const startWindowEvery = (this.startWindowEvery > 0) ? this.startWindowEvery : this.windowSize;
    const destination = this.destination;
    const windowSize = this.windowSize;
    const windows = this.windows;
    const len = windows.length;

    for (let i = 0; i < len && !this.closed; i++) {
      windows[i].next(value);
    }
    const c = this.count - windowSize + 1;
    if (c >= 0 && c % startWindowEvery === 0 && !this.closed) {
      windows.shift().complete();
    }
    if (++this.count % startWindowEvery === 0 && !this.closed) {
      const window = new Subject<T>();
      windows.push(window);
      destination.next(window);
    }
  }

  protected _error(err: any) {
    const windows = this.windows;
    if (windows) {
      while (windows.length > 0 && !this.closed) {
        windows.shift().error(err);
      }
    }
    this.destination.error(err);
  }

  protected _complete() {
    const windows = this.windows;
    if (windows) {
      while (windows.length > 0 && !this.closed) {
        windows.shift().complete();
      }
    }
    this.destination.complete();
  }

  protected _unsubscribe() {
    this.count = 0;
    this.windows = null;
  }
}
