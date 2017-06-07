import { IScheduler } from '../Scheduler';
import { Action } from '../scheduler/Action';
import { Subject } from '../Subject';
import { Operator } from '../Operator';
import { async } from '../scheduler/async';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { isNumeric } from '../util/isNumeric';
import { isScheduler } from '../util/isScheduler';

/**
 * 周期性地将源 Observable 的值分支成嵌套的 Observable 。
 *
 * <span class="informal">就像是 {@link bufferTime}，但是发出的是嵌套的
 * Observable 而不是数组.</span>
 *
 * <img src="./img/windowTime.png" width="100%">
 *
 * 返回一个发出从源 Observable 收集到数据的窗口 Observable。输出 Observable 周期性的开启新窗口 ，由
 * `windowCreationInterval` 参数决定。它在一个固定的时间跨度发出每个新窗口， 由`windowTimeSpan` 参数指定。
 * 当源 Observable 完成或者遇到错误， 输出 Observable 发出当前窗口并且将源 Observable 的通知传播出去。 如果
 * `windowCreationInterval` 没有被提供, 输出 Observable 开启一个新的窗口当前一个window度过了`windowTimeSpan`。
 * 如果`maxWindowCount` 被提供了, 每个窗口将最多发射若干个固定值。 窗口将会立刻完成当最后一个值发出并且下个会在
 * 由`windowTimeSpan` 和 `windowCreationInterval` 参数决定的时间开启。
 *
 * @example <caption>在每一个1秒的窗口, 发出最多两个点击事件</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.windowTime(1000)
 *   .map(win => win.take(2)) // 每个窗口最多两次发射
 *   .mergeAll(); // 打平高阶 Observable
 * result.subscribe(x => console.log(x));
 *
 * @example <caption>每5秒启动一个窗口1秒长, 每个窗口发出最多两个点击事件</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.windowTime(1000, 5000)
 *   .map(win => win.take(2)) // 每个窗口最多两次发射
 *   .mergeAll(); // 打平高阶 Observable
 * result.subscribe(x => console.log(x));
 *
 * @example <caption>和上面的例子一样，但是用 maxWindowCount 代替 take</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.windowTime(1000, 5000, 2) // 每个窗口最多两次发射
 *   .mergeAll(); // 打平高阶 Observable
 * result.subscribe(x => console.log(x));

 * @see {@link window}
 * @see {@link windowCount}
 * @see {@link windowToggle}
 * @see {@link windowWhen}
 * @see {@link bufferTime}
 *
 * @param {number} windowTimeSpan 填充每个窗口的时间量。
 * @param {number} [windowCreationInterval] 启动新窗口的间隔。
 * @param {number} [maxWindowSize=Number.POSITIVE_INFINITY] 每个窗口在完成前可以发送的最大值。
 * @param {Scheduler} [scheduler=async] 调度器，以确定确定窗口边界的时间间隔。
 * @return {Observable<Observable<T>>} 窗口的 Observable，每个窗口又是值的 Observable 。(译者注：其实就是高阶 Observable )
 * @method windowTime
 * @owner Observable
 */
export function windowTime<T>(this: Observable<T>, windowTimeSpan: number,
                              scheduler?: IScheduler): Observable<Observable<T>>;
export function windowTime<T>(this: Observable<T>, windowTimeSpan: number,
                              windowCreationInterval: number,
                              scheduler?: IScheduler): Observable<Observable<T>>;
export function windowTime<T>(this: Observable<T>, windowTimeSpan: number,
                              windowCreationInterval: number,
                              maxWindowSize: number,
                              scheduler?: IScheduler): Observable<Observable<T>>;

export function windowTime<T>(this: Observable<T>,
                              windowTimeSpan: number): Observable<Observable<T>> {

  let scheduler: IScheduler = async;
  let windowCreationInterval: number = null;
  let maxWindowSize: number = Number.POSITIVE_INFINITY;

  if (isScheduler(arguments[3])) {
    scheduler = arguments[3];
  }

  if (isScheduler(arguments[2])) {
    scheduler = arguments[2];
  } else if (isNumeric(arguments[2])) {
    maxWindowSize = arguments[2];
  }

  if (isScheduler(arguments[1])) {
    scheduler = arguments[1];
  } else if (isNumeric(arguments[1])) {
    windowCreationInterval = arguments[1];
  }

  return this.lift(new WindowTimeOperator<T>(windowTimeSpan, windowCreationInterval, maxWindowSize, scheduler));
}

class WindowTimeOperator<T> implements Operator<T, Observable<T>> {

  constructor(private windowTimeSpan: number,
              private windowCreationInterval: number | null,
              private maxWindowSize: number,
              private scheduler: IScheduler) {
  }

  call(subscriber: Subscriber<Observable<T>>, source: any): any {
    return source.subscribe(new WindowTimeSubscriber(
      subscriber, this.windowTimeSpan, this.windowCreationInterval, this.maxWindowSize, this.scheduler
    ));
  }
}

interface CreationState<T> {
  windowTimeSpan: number;
  windowCreationInterval: number;
  subscriber: WindowTimeSubscriber<T>;
  scheduler: IScheduler;
}

interface TimeSpanOnlyState<T> {
    window: CountedSubject<T>;
    windowTimeSpan: number;
    subscriber: WindowTimeSubscriber<T>;
  }

interface CloseWindowContext<T> {
  action: Action<CreationState<T>>;
  subscription: Subscription;
}

interface CloseState<T> {
  subscriber: WindowTimeSubscriber<T>;
  window: CountedSubject<T>;
  context: CloseWindowContext<T>;
}

class CountedSubject<T> extends Subject<T> {
  private _numberOfNextedValues: number = 0;

  next(value?: T): void {
    this._numberOfNextedValues++;
    super.next(value);
  }

  get numberOfNextedValues(): number {
    return this._numberOfNextedValues;
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class WindowTimeSubscriber<T> extends Subscriber<T> {
  private windows: CountedSubject<T>[] = [];

  constructor(protected destination: Subscriber<Observable<T>>,
              private windowTimeSpan: number,
              private windowCreationInterval: number | null,
              private maxWindowSize: number,
              private scheduler: IScheduler) {
    super(destination);

    const window = this.openWindow();
    if (windowCreationInterval !== null && windowCreationInterval >= 0) {
      const closeState: CloseState<T> = { subscriber: this, window, context: <any>null };
      const creationState: CreationState<T> = { windowTimeSpan, windowCreationInterval, subscriber: this, scheduler };
      this.add(scheduler.schedule(dispatchWindowClose, windowTimeSpan, closeState));
      this.add(scheduler.schedule(dispatchWindowCreation, windowCreationInterval, creationState));
    } else {
      const timeSpanOnlyState: TimeSpanOnlyState<T> = { subscriber: this, window, windowTimeSpan };
      this.add(scheduler.schedule(dispatchWindowTimeSpanOnly, windowTimeSpan, timeSpanOnlyState));
    }
  }

  protected _next(value: T): void {
    const windows = this.windows;
    const len = windows.length;
    for (let i = 0; i < len; i++) {
      const window = windows[i];
      if (!window.closed) {
        window.next(value);
        if (window.numberOfNextedValues >= this.maxWindowSize) {
          this.closeWindow(window);
        }
      }
    }
  }

  protected _error(err: any): void {
    const windows = this.windows;
    while (windows.length > 0) {
      windows.shift().error(err);
    }
    this.destination.error(err);
  }

  protected _complete(): void {
    const windows = this.windows;
    while (windows.length > 0) {
      const window = windows.shift();
      if (!window.closed) {
        window.complete();
      }
    }
    this.destination.complete();
  }

  public openWindow(): CountedSubject<T> {
    const window = new CountedSubject<T>();
    this.windows.push(window);
    const destination = this.destination;
    destination.next(window);
    return window;
  }

  public closeWindow(window: CountedSubject<T>): void {
    window.complete();
    const windows = this.windows;
    windows.splice(windows.indexOf(window), 1);
  }
}

function dispatchWindowTimeSpanOnly<T>(this: Action<TimeSpanOnlyState<T>>, state: TimeSpanOnlyState<T>): void {
  const { subscriber, windowTimeSpan, window } = state;
  if (window) {
    subscriber.closeWindow(window);
  }
  state.window = subscriber.openWindow();
  this.schedule(state, windowTimeSpan);
}

function dispatchWindowCreation<T>(this: Action<CreationState<T>>, state: CreationState<T>): void {
  const { windowTimeSpan, subscriber, scheduler, windowCreationInterval } = state;
  const window = subscriber.openWindow();
  const action = this;
  let context: CloseWindowContext<T> = { action, subscription: <any>null };
  const timeSpanState: CloseState<T> = { subscriber, window, context };
  context.subscription = scheduler.schedule(dispatchWindowClose, windowTimeSpan, timeSpanState);
  action.add(context.subscription);
  action.schedule(state, windowCreationInterval);
}

function dispatchWindowClose<T>(state: CloseState<T>): void {
  const { subscriber, window, context } = state;
  if (context && context.action && context.subscription) {
    context.action.remove(context.subscription);
  }
  subscriber.closeWindow(window);
}
