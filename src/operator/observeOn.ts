import { Observable } from '../Observable';
import { IScheduler } from '../Scheduler';
import { Operator } from '../Operator';
import { PartialObserver } from '../Observer';
import { Subscriber } from '../Subscriber';
import { Notification } from '../Notification';
import { TeardownLogic } from '../Subscription';
import { Action } from '../scheduler/Action';

/**
 *
 * 使用指定的调度器来重新发出源 Observable 的所有通知。
 *
 * <span class="informal">确保从 Observable 的外部使用特定的调度器。</span>
 *
 * `observeOn` 操作符接收一个 scheduler 作为第一个参数，它将用于重新安排源 Observable 所发送的通知。如果你不能控制
 * 给定 Observable 的内部调度器，但是想要控制何时发出值，那么这个操作符可能是有用的。
 *
 * 返回的 Observable 发出与源 Observable 相同的通知(`next`、`complete` 和 `error`)，但是使用提供的调度器进行了重新安排。
 * 注意，这并不意味着源 Observables 的内部调度器会以任何形式被替换。原始的调度器仍然会被使用，但是当源 Observable 发出
 * 通知时，它会立即重新安排(这时候使用传给 `observeOn` 的调度器)。在同步地发出大量的值的 Observalbe 上调用 `observeOn` 
 * 是一种反模式，这会将 Observable 的发送分解成异步块。为了实现这一点，调度器必须直接传递给源 Observable (通常是创建它的操作符)。
 * `observeOn` 只是简单地像通知延迟一些，以确保这些通知在预期的时间点发出。
 *
 * 事实上，`observeOn` 接收第二个参数，它以毫秒为单位指定延迟通知的发送时间。`observeOn` 与 {@link delay} 
 * 操作符最主要的区别是它会延迟所有通知，包括错误通知，而 `delay` 会当源 Observable 发出错误时立即通过错误。
 * 通常来说，对于想延迟流中的任何值，强烈推荐使用 `delay` 操作符，而使用 `observeOn` 时，用来指定应该使用
 * 哪个调度器来进行通知发送。
 *
 * @example <caption>确保在浏览器重绘前调用订阅中的值。</caption>
 * const intervals = Rx.Observable.interval(10); // 默认情况下，interval 使用异步调度器进行调度
 *
 * intervals
 * .observeOn(Rx.Scheduler.animationFrame)       // 但我们将在 animationFrame 调度器上进行观察，
 * .subscribe(val => {                           // 以确保动画的流畅性。
 *   someDiv.style.height = val + 'px';
 * });
 *
 * @see {@link delay}
 *
 * @param {IScheduler} scheduler 用于重新安排源 Observable 的通知的调度器。
 * @param {number} [delay] 应该重新安排的每个通知的延迟时间的毫秒数。
 * @return {Observable<T>} 该 Observable 发出与源 Observale 同样的通知，但是使用了提供的调度器。
 *
 * @method observeOn
 * @owner Observable
 */
export function observeOn<T>(this: Observable<T>, scheduler: IScheduler, delay: number = 0): Observable<T> {
  return this.lift(new ObserveOnOperator(scheduler, delay));
}

export class ObserveOnOperator<T> implements Operator<T, T> {
  constructor(private scheduler: IScheduler, private delay: number = 0) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new ObserveOnSubscriber(subscriber, this.scheduler, this.delay));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class ObserveOnSubscriber<T> extends Subscriber<T> {
  static dispatch(this: Action<ObserveOnMessage>, arg: ObserveOnMessage) {
    const { notification, destination } = arg;
    notification.observe(destination);
    this.unsubscribe();
  }

  constructor(destination: Subscriber<T>,
              private scheduler: IScheduler,
              private delay: number = 0) {
    super(destination);
  }

  private scheduleMessage(notification: Notification<any>): void {
    this.add(this.scheduler.schedule(
      ObserveOnSubscriber.dispatch,
      this.delay,
      new ObserveOnMessage(notification, this.destination)
    ));
  }

  protected _next(value: T): void {
    this.scheduleMessage(Notification.createNext(value));
  }

  protected _error(err: any): void {
    this.scheduleMessage(Notification.createError(err));
  }

  protected _complete(): void {
    this.scheduleMessage(Notification.createComplete());
  }
}

export class ObserveOnMessage {
  constructor(public notification: Notification<any>,
              public destination: PartialObserver<any>) {
  }
}
