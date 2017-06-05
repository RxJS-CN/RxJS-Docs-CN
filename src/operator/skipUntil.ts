import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 返回一个 Observable，该 Observable 会跳过源 Observable 发出的值直到第二个 Observable 开始发送。
 *
 * <img src="./img/skipUntil.png" width="100%">
 *
 * @param {Observable} notifier - 第二个 Observable ，它发出后，结果 Observable 开始镜像源 Observable 的元素。
 * @return {Observable<T>} Observable 跳过源 Observable 发出的值直到第二个 Observable 开始发送, 然后发出剩下的数据项。
 * @method skipUntil
 * @owner Observable
 */
export function skipUntil<T>(this: Observable<T>, notifier: Observable<any>): Observable<T> {
  return this.lift(new SkipUntilOperator(notifier));
}

class SkipUntilOperator<T> implements Operator<T, T> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new SkipUntilSubscriber(subscriber, this.notifier));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SkipUntilSubscriber<T, R> extends OuterSubscriber<T, R> {

  private hasValue: boolean = false;
  private isInnerStopped: boolean = false;

  constructor(destination: Subscriber<any>,
              notifier: Observable<any>) {
    super(destination);
    this.add(subscribeToResult(this, notifier));
  }

  protected _next(value: T) {
    if (this.hasValue) {
      super._next(value);
    }
  }

  protected _complete() {
    if (this.isInnerStopped) {
      super._complete();
    } else {
      this.unsubscribe();
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this.hasValue = true;
  }

  notifyComplete(): void {
    this.isInnerStopped = true;
    if (this.isStopped) {
      super._complete();
    }
  }
}
