import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { IScheduler } from '../Scheduler';
import { Subscription, TeardownLogic } from '../Subscription';
import { async } from '../scheduler/async';

/**
 * 发送源Observable中一个特定时间段之后还没有发送的值.
 *
 * <span class="informal">就像是{@link delay}, 但是只发送最新的值.</span>
 *
 * <img src="./img/debounceTime.png" width="100%">
 *
 * `debounceTime`延时发送源Observable发送的值,但是会丢弃正在排队的发送如果源Observable
 * 又发出新值. 该操作符追逐了源Observable中最新的值, 并且发出它当且仅当在`dueTime`时间段内
 * 没有发送行为. 如果新的值在`dueTime`静默时间段出现, 之前的值会被丢弃并且不会在输出Observable
 * 中发出.
 *
 * 这是一个控制速率的操作符, 因为不可能在窗口的`dueTime`时间段内发送任何值, 同样也是一个延时类操作符因为输出
 * 并不一定发生在同一时间因为是源Observable上发生的. 可选参数{@link IScheduler}管理时间.
 *
 * @example <caption>发出点击后的最近点击</caption>
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
 * 提供的时间单位)的时间间隔.
 * @param {Scheduler} [scheduler=async] {@link IScheduler} 用来管理时间，处理每个值
 * 的超时时间段.
 * @return {Observable} Observable，延时发送源Observable的发送在特定的`dueTime`, 并且
 * 也会去丢弃一些值如果发送太频繁.
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
