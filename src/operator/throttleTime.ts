import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { IScheduler } from '../Scheduler';
import { Subscription, TeardownLogic } from '../Subscription';
import { async } from '../scheduler/async';
import { Observable } from '../Observable';
import { ThrottleConfig, defaultThrottleConfig } from './throttle';

/**
 * 从源 Observable 中发出一个值，然后在 `duration` 毫秒内忽略随后发出的源值，
 * 然后重复此过程。
 *
 * <span class="informal">让一个值通过，然后在接下来的 `duration` 毫秒内忽略源值。</span>
 *
 * <img src="./img/throttleTime.png" width="100%">
 *
 * 当 `throttle` 的内部定时器禁用时，它会在输出 Observable 上发出源 Observable 的值，
 * 并当定时器启用时忽略源值。最开始时，定时器是禁用的。一旦第一个源值达到，它会被转发
 * 到输出 Observable ，然后启动定时器。在 `duration` 毫秒(或由可选的 `scheduler` 
 * 内部确定的时间单位)后，定时器会被禁用，并且下一个源值也是重复此过程。可选择性地
 * 接收一个 {@link IScheduler} 用来管理定时器。
 *
 * @example <caption>以每秒最多点击一次的频率发出点击事件</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.throttleTime(1000);
 * result.subscribe(x => console.log(x));
 *
 * @see {@link auditTime}
 * @see {@link debounceTime}
 * @see {@link delay}
 * @see {@link sampleTime}
 * @see {@link throttle}
 *
 * @param {number} duration 在发出一个最新的值后，到再发出另外一个值之间的等待时间，
 * 以毫秒为单位或以可选的 `scheduler` 内部决定的时间单位来衡量。
 * @param {Scheduler} [scheduler=async] 调度器( {@link IScheduler} )，用来
 * 管理处理节流的定时器。
 * @return {Observable<T>} 该 Observable 执行节流操作，以限制源 Observable 的
 * 发送频率。
 * @method throttleTime
 * @owner Observable
 */
export function throttleTime<T>(this: Observable<T>,
                                duration: number,
                                scheduler: IScheduler = async,
                                config: ThrottleConfig = defaultThrottleConfig): Observable<T> {
  return this.lift(new ThrottleTimeOperator(duration, scheduler, config.leading, config.trailing));
}

class ThrottleTimeOperator<T> implements Operator<T, T> {
  constructor(private duration: number,
              private scheduler: IScheduler,
              private leading: boolean,
              private trailing: boolean) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(
      new ThrottleTimeSubscriber(subscriber, this.duration, this.scheduler, this.leading, this.trailing)
    );
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class ThrottleTimeSubscriber<T> extends Subscriber<T> {
  private throttled: Subscription;
  private _hasTrailingValue: boolean = false;
  private _trailingValue: T = null;

  constructor(destination: Subscriber<T>,
              private duration: number,
              private scheduler: IScheduler,
              private leading: boolean,
              private trailing: boolean) {
    super(destination);
  }

  protected _next(value: T) {
    if (this.throttled) {
      if (this.trailing) {
        this._trailingValue = value;
        this._hasTrailingValue = true;
      }
    } else {
      this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.duration, { subscriber: this }));
      if (this.leading) {
        this.destination.next(value);
      }
    }
  }

  clearThrottle() {
    const throttled = this.throttled;
    if (throttled) {
      if (this.trailing && this._hasTrailingValue) {
        this.destination.next(this._trailingValue);
        this._trailingValue = null;
        this._hasTrailingValue = false;
      }
      throttled.unsubscribe();
      this.remove(throttled);
      this.throttled = null;
    }
  }
}

interface DispatchArg<T> {
  subscriber: ThrottleTimeSubscriber<T>;
}

function dispatchNext<T>(arg: DispatchArg<T>) {
  const { subscriber } = arg;
  subscriber.clearThrottle();
}
