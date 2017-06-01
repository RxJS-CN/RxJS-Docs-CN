import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { TeardownLogic } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 发出源 Observable 最新发出的值当另一个 `notifier` Observable发送时.
 *
 * <span class="informal">就像是 {@link sampleTime}, 但是无论何时`notifier` Observable
 * 进行了发送都会去取样.</span>
 *
 * <img src="./img/sample.png" width="100%">
 *
 * 无论何时 `notifier` Observable 发出一个值或者完成, `sample` 会去源 Observable 中发送上次
 * 取样后源 Observable 发出的最新值, 除非源在上一次取样后没有发出值. `notifier`会被订阅只要输出
 * Observable 被订阅.
 *
 * @example <caption>每次点击, 取样最新的 "seconds" 时间器</caption>
 * var seconds = Rx.Observable.interval(1000);
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = seconds.sample(clicks);
 * result.subscribe(x => console.log(x));
 *
 * @see {@link audit}
 * @see {@link debounce}
 * @see {@link sampleTime}
 * @see {@link throttle}
 *
 * @param {Observable<any>} notifier 被用来取样的源 Observable.
 * @return {Observable<T>} Observable，该 Observable 发出当通知 Observable
 * 发出值或者完成时从源 Observable 取样的最新值.
 * @method sample
 * @owner Observable
 */
export function sample<T>(this: Observable<T>, notifier: Observable<any>): Observable<T> {
  return this.lift(new SampleOperator(notifier));
}

class SampleOperator<T> implements Operator<T, T> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    const sampleSubscriber = new SampleSubscriber(subscriber);
    const subscription = source.subscribe(sampleSubscriber);
    subscription.add(subscribeToResult(sampleSubscriber, this.notifier));
    return subscription;
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SampleSubscriber<T, R> extends OuterSubscriber<T, R> {
  private value: T;
  private hasValue: boolean = false;

  protected _next(value: T) {
    this.value = value;
    this.hasValue = true;
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this.emitValue();
  }

  notifyComplete(): void {
    this.emitValue();
  }

  emitValue() {
    if (this.hasValue) {
      this.hasValue = false;
      this.destination.next(this.value);
    }
  }
}
