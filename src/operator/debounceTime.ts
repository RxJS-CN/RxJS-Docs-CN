import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { IScheduler } from '../Scheduler';
import { Subscription, TeardownLogic } from '../Subscription';
import { async } from '../scheduler/async';

/**
 * 只有在特定的一段时间经过后并且没有发出另一个源值，才从源 Observable 中发出一个值。
 *
 * <span class="informal">就像是{@link delay}, 但是只通过每次大量发送中的最新值。</span>
 *
 * <img src="./img/debounceTime.png" width="100%">
 *
 * `debounceTime` 延时发送源 Observable 发送的值,但是会丢弃正在排队的发送如果源 Observable
 * 又发出新值。 该操作符会追踪源 Observable 的最新值, 并且发出它当且仅当在 `dueTime` 时间段内
 * 没有发送行为。 如果新的值在`dueTime`静默时间段出现, 之前的值会被丢弃并且不会在输出 Observable
 * 中发出。
 *
 * 这是一个控制发送频率的操作符，因为不可能在任何时间窗口的持续时间(dueTime)内发出一个以上的值，同样也是一个延时类操作符，因为输出
 * 并不一定发生在同一时间，正如源 Observable 上发生的。 可选性的接收一个 {@link IScheduler} 用于管理定时器。
 *
 * @example <caption>在一顿狂点后只发出最新的点击</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.debounceTime(1000);
 * result.subscribe(x => console.log(x));
 *
 * @see {@link auditTime}
 * @see {@link debounce}
 * @see {@link delay}
 * @see {@link sampleTime}
 * @see {@link throttleTime}
 *
 * @param {number} dueTime 在发送最新的源值之前需要等待的以毫秒为单位(或者由可选的`scheduler`
 * 提供的时间单位)的时间间隔。
 * @param {Scheduler} [scheduler=async] 调节器( {@link IScheduler} )，用于管理处理每个值的延时的定时器。
 * @return {Observable} Observable，通过指定的 dueTime 来延迟源 Observable 的发送，如果发送过于频繁可能会丢弃一些值。
 * @method debounceTime
 * @owner Observable
 */
export function debounceTime<T>(this: Observable<T>, dueTime: number, scheduler: IScheduler = async): Observable<T> {
  return this.lift(new DebounceTimeOperator(dueTime, scheduler));
}

class DebounceTimeOperator<T> implements Operator<T, T> {
  constructor(private dueTime: number, private scheduler: IScheduler) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new DebounceTimeSubscriber(subscriber, this.dueTime, this.scheduler));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DebounceTimeSubscriber<T> extends Subscriber<T> {
  private debouncedSubscription: Subscription = null;
  private lastValue: T = null;
  private hasValue: boolean = false;

  constructor(destination: Subscriber<T>,
              private dueTime: number,
              private scheduler: IScheduler) {
    super(destination);
  }

  protected _next(value: T) {
    this.clearDebounce();
    this.lastValue = value;
    this.hasValue = true;
    this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext, this.dueTime, this));
  }

  protected _complete() {
    this.debouncedNext();
    this.destination.complete();
  }

  debouncedNext(): void {
    this.clearDebounce();

    if (this.hasValue) {
      this.destination.next(this.lastValue);
      this.lastValue = null;
      this.hasValue = false;
    }
  }

  private clearDebounce(): void {
    const debouncedSubscription = this.debouncedSubscription;

    if (debouncedSubscription !== null) {
      this.remove(debouncedSubscription);
      debouncedSubscription.unsubscribe();
      this.debouncedSubscription = null;
    }
  }
}

function dispatchNext(subscriber: DebounceTimeSubscriber<any>) {
  subscriber.debouncedNext();
}
