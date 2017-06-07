import { IScheduler } from '../Scheduler';
import { Action } from '../scheduler/Action';
import { Operator } from '../Operator';
import { async } from '../scheduler/async';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { isScheduler } from '../util/isScheduler';

/* tslint:disable:max-line-length */
export function bufferTime<T>(this: Observable<T>, bufferTimeSpan: number, scheduler?: IScheduler): Observable<T[]>;
export function bufferTime<T>(this: Observable<T>, bufferTimeSpan: number, bufferCreationInterval: number, scheduler?: IScheduler): Observable<T[]>;
export function bufferTime<T>(this: Observable<T>, bufferTimeSpan: number, bufferCreationInterval: number, maxBufferSize: number, scheduler?: IScheduler): Observable<T[]>;
/* tslint:enable:max-line-length */

/**
 * 在特定时间周期内缓冲源 Observable 的值。
 *
 * <span class="informal">将过往的值收集到数组中，并周期性地发出这些数组。</span>
 *
 * <img src="./img/bufferTime.png" width="100%">
 *
 * 在一个特定的持续时间`bufferTimeSpan`内缓存源 Observable 的值。 除非指定了可选参数`bufferCreationInterval`
 * , 它会发出数组并且重置缓冲区每个`bufferTimeSpan`毫秒。这个操作符会在每个 bufferCreationInterval 毫秒时开启缓冲区，
 * 并在每个 bufferTimeSpan 毫秒时关闭(发出并重置)缓冲区。如果可选参数`maxBufferSize`被指定, 缓冲区会在`bufferTimeSpan`毫秒
 * 之后或者缓冲区元素个数达到`maxBufferSize`时发出。
 *
 * @example <caption>每一秒都发出最新点击事件的数组</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var buffered = clicks.bufferTime(1000);
 * buffered.subscribe(x => console.log(x));
 *
 * @example <caption>每5秒钟，发出接下来2秒内的点击事件(译者注：后3秒内的点击会被忽略)</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var buffered = clicks.bufferTime(2000, 5000);
 * buffered.subscribe(x => console.log(x));
 *
 * @see {@link buffer}
 * @see {@link bufferCount}
 * @see {@link bufferToggle}
 * @see {@link bufferWhen}
 * @see {@link windowTime}
 *
 * @param {number} bufferTimeSpan 填满每个缓冲数组的时间。
 * @param {number} [bufferCreationInterval] 开启新缓冲区的时间间隔。
 * @param {number} [maxBufferSize] 缓冲区的最大容量。
 * @param {Scheduler} [scheduler=async] 调度器，调度缓冲区。 
 * @return {Observable<T[]>} 值为缓冲数组的 observable。
 * @method bufferTime
 * @owner Observable
 */
export function bufferTime<T>(this: Observable<T>, bufferTimeSpan: number): Observable<T[]> {
  let length: number = arguments.length;

  let scheduler: IScheduler = async;
  if (isScheduler(arguments[arguments.length - 1])) {
    scheduler = arguments[arguments.length - 1];
    length--;
  }

  let bufferCreationInterval: number = null;
  if (length >= 2) {
    bufferCreationInterval = arguments[1];
  }

  let maxBufferSize: number = Number.POSITIVE_INFINITY;
  if (length >= 3) {
    maxBufferSize = arguments[2];
  }

  return this.lift(new BufferTimeOperator<T>(bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler));
}

class BufferTimeOperator<T> implements Operator<T, T[]> {
  constructor(private bufferTimeSpan: number,
              private bufferCreationInterval: number,
              private maxBufferSize: number,
              private scheduler: IScheduler) {
  }

  call(subscriber: Subscriber<T[]>, source: any): any {
    return source.subscribe(new BufferTimeSubscriber(
      subscriber, this.bufferTimeSpan, this.bufferCreationInterval, this.maxBufferSize, this.scheduler
    ));
  }
}

class Context<T> {
  buffer: T[] = [];
  closeAction: Subscription;
}

type CreationState<T> = {
  bufferTimeSpan: number;
  bufferCreationInterval: number,
  subscriber: BufferTimeSubscriber<T>;
  scheduler: IScheduler;
};

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class BufferTimeSubscriber<T> extends Subscriber<T> {
  private contexts: Array<Context<T>> = [];
  private timespanOnly: boolean;

  constructor(destination: Subscriber<T[]>,
              private bufferTimeSpan: number,
              private bufferCreationInterval: number,
              private maxBufferSize: number,
              private scheduler: IScheduler) {
    super(destination);
    const context = this.openContext();
    this.timespanOnly = bufferCreationInterval == null || bufferCreationInterval < 0;
    if (this.timespanOnly) {
      const timeSpanOnlyState = { subscriber: this, context, bufferTimeSpan };
      this.add(context.closeAction = scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
    } else {
      const closeState = { subscriber: this, context };
      const creationState: CreationState<T> = { bufferTimeSpan, bufferCreationInterval, subscriber: this, scheduler };
      this.add(context.closeAction = scheduler.schedule(dispatchBufferClose, bufferTimeSpan, closeState));
      this.add(scheduler.schedule(dispatchBufferCreation, bufferCreationInterval, creationState));
    }
  }

  protected _next(value: T) {
    const contexts = this.contexts;
    const len = contexts.length;
    let filledBufferContext: Context<T>;
    for (let i = 0; i < len; i++) {
      const context = contexts[i];
      const buffer = context.buffer;
      buffer.push(value);
      if (buffer.length == this.maxBufferSize) {
        filledBufferContext = context;
      }
    }

    if (filledBufferContext) {
      this.onBufferFull(filledBufferContext);
    }
  }

  protected _error(err: any) {
    this.contexts.length = 0;
    super._error(err);
  }

  protected _complete() {
    const { contexts, destination } = this;
    while (contexts.length > 0) {
      const context = contexts.shift();
      destination.next(context.buffer);
    }
    super._complete();
  }

  protected _unsubscribe() {
    this.contexts = null;
  }

  protected onBufferFull(context: Context<T>) {
    this.closeContext(context);
    const closeAction = context.closeAction;
    closeAction.unsubscribe();
    this.remove(closeAction);

    if (!this.closed && this.timespanOnly) {
      context = this.openContext();
      const bufferTimeSpan = this.bufferTimeSpan;
      const timeSpanOnlyState = { subscriber: this, context, bufferTimeSpan };
      this.add(context.closeAction = this.scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
    }
  }

  openContext(): Context<T> {
    const context: Context<T> = new Context<T>();
    this.contexts.push(context);
    return context;
  }

  closeContext(context: Context<T>) {
    this.destination.next(context.buffer);
    const contexts = this.contexts;

    const spliceIndex = contexts ? contexts.indexOf(context) : -1;
    if (spliceIndex >= 0) {
      contexts.splice(contexts.indexOf(context), 1);
    }
  }
}

function dispatchBufferTimeSpanOnly(this: Action<any>, state: any) {
  const subscriber: BufferTimeSubscriber<any> = state.subscriber;

  const prevContext = state.context;
  if (prevContext) {
    subscriber.closeContext(prevContext);
  }

  if (!subscriber.closed) {
    state.context = subscriber.openContext();
    state.context.closeAction = this.schedule(state, state.bufferTimeSpan);
  }
}

interface DispatchArg<T> {
  subscriber: BufferTimeSubscriber<T>;
  context: Context<T>;
}

function dispatchBufferCreation<T>(this: Action<CreationState<T>>, state: CreationState<T>) {
  const { bufferCreationInterval, bufferTimeSpan, subscriber, scheduler } = state;
  const context = subscriber.openContext();
  const action = <Action<CreationState<T>>>this;
  if (!subscriber.closed) {
    subscriber.add(context.closeAction = scheduler.schedule<DispatchArg<T>>(dispatchBufferClose, bufferTimeSpan, { subscriber, context }));
    action.schedule(state, bufferCreationInterval);
  }
}

function dispatchBufferClose<T>(arg: DispatchArg<T>) {
  const { subscriber, context } = arg;
  subscriber.closeContext(context);
}
