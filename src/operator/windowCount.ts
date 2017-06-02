import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subject } from '../Subject';

/**
 * 当每个嵌套 Observable 将要发出的值达到了 `windowSize`时，分支源 Observable 的值作为嵌套 Observable。
 *
 * <span class="informal">就像是 {@link bufferCount}, 但是返回嵌套的 Observable而不是数组。</span>
 *
 * <img src="./img/windowCount.png" width="100%">

 * 返回一个发出从源 Observable 收集到数据的 window Observable。 输出 Observable 发出连接的，不重叠的 
 * windows. 它会发出目前的 window 并且会打开一个新的当`windowBoundaries` Observable开始发出数据。 
 * 因为每个 window 都是 Observable， 所以输出 Observable 是高阶 Observable。
 * 输出 Observable 发出 windows 每个 `startWindowEvery` 数据项, 每个最多包含 `windowSize` 个数据项。 
 * 当源 Observable 完成或者遇到错误,输出 Observable 发出当前 window 并且传播从源 Observable 收到的通知。 
 * 如果 `startWindowEvery` 没有被提供, 那么新的 windows 会在每个 window 的数据项达到`windowSize`时立刻
 * 开启新的 window 在源的起始处。
 *
 * @example <caption>忽略每个第三次点击事件, 从第一个开始</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.windowCount(3)
 *   .map(win => win.skip(1)) // skip first of every 3 clicks
 *   .mergeAll(); // flatten the Observable-of-Observables
 * result.subscribe(x => console.log(x));
 *
 * @example <caption>忽略每个第三次点击事件, 从第三个开始</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.windowCount(2, 3)
 *   .mergeAll(); // flatten the Observable-of-Observables
 * result.subscribe(x => console.log(x));
 *
 * @see {@link window}
 * @see {@link windowTime}
 * @see {@link windowToggle}
 * @see {@link windowWhen}
 * @see {@link bufferCount}
 *
 * @param {number} windowSize 每个 window 最多可以发送的个数。
 * @param {number} [startWindowEvery] 开启新 window 的间隔。
 * 比如，如果 `startWindowEvery` 是 `2`, 新 window 会在源中每个第二个值开启。 每个最新的 window 默认是在源
 * 的头开启。
 * @return {Observable<Observable<T>>} windows 型的 Observable, 相应的是 Observable 
 * 的值。
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
