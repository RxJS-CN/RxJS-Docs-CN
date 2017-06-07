import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';

import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 缓冲源 Observable 的值, 使用关闭 Observable 的工厂函数来决定何时关闭、发出和重置缓冲区。
 *
 * <span class="informal">将过往的值收集到数组中， 当开始收集数据的时候, 调用函数返回
 * Observable, 该 Observable 告知何时关闭缓冲区并重新开始收集。</span>
 *
 * <img src="./img/bufferWhen.png" width="100%">
 *
 * 立马开启缓冲区, 然后当`closingSelector`函数返回的observable发出数据的时候关闭缓冲区.
 * 当关闭缓冲区的时候, 会立马开启新的缓冲区，并不断重复此过程。
 *
 * @example <caption>发出每个随机秒(1-5秒)数内的最新点击事件数组。</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var buffered = clicks.bufferWhen(() =>
 *   Rx.Observable.interval(1000 + Math.random() * 4000)
 * );
 * buffered.subscribe(x => console.log(x));
 *
 * @see {@link buffer}
 * @see {@link bufferCount}
 * @see {@link bufferTime}
 * @see {@link bufferToggle}
 * @see {@link windowWhen}
 *
 * @param {function(): Observable} closingSelector 该函数不接受参数，并返回通知缓冲区关闭的 Observable 。
 * @return {Observable<T[]>} 缓冲数组的 Observable 。
 * @method bufferWhen
 * @owner Observable
 */
export function bufferWhen<T>(this: Observable<T>, closingSelector: () => Observable<any>): Observable<T[]> {
  return this.lift(new BufferWhenOperator<T>(closingSelector));
}

class BufferWhenOperator<T> implements Operator<T, T[]> {

  constructor(private closingSelector: () => Observable<any>) {
  }

  call(subscriber: Subscriber<T[]>, source: any): any {
    return source.subscribe(new BufferWhenSubscriber(subscriber, this.closingSelector));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class BufferWhenSubscriber<T> extends OuterSubscriber<T, any> {
  private buffer: T[];
  private subscribing: boolean = false;
  private closingSubscription: Subscription;

  constructor(destination: Subscriber<T[]>, private closingSelector: () => Observable<any>) {
    super(destination);
    this.openBuffer();
  }

  protected _next(value: T) {
    this.buffer.push(value);
  }

  protected _complete() {
    const buffer = this.buffer;
    if (buffer) {
      this.destination.next(buffer);
    }
    super._complete();
  }

  protected _unsubscribe() {
    this.buffer = null;
    this.subscribing = false;
  }

  notifyNext(outerValue: T, innerValue: any,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, any>): void {
    this.openBuffer();
  }

  notifyComplete(): void {
    if (this.subscribing) {
      this.complete();
    } else {
      this.openBuffer();
    }
  }

  openBuffer() {

    let { closingSubscription } = this;

    if (closingSubscription) {
      this.remove(closingSubscription);
      closingSubscription.unsubscribe();
    }

    const buffer = this.buffer;
    if (this.buffer) {
      this.destination.next(buffer);
    }

    this.buffer = [];

    const closingNotifier = tryCatch(this.closingSelector)();

    if (closingNotifier === errorObject) {
      this.error(errorObject.e);
    } else {
      closingSubscription = new Subscription();
      this.closingSubscription = closingSubscription;
      this.add(closingSubscription);
      this.subscribing = true;
      closingSubscription.add(subscribeToResult(this, closingNotifier));
      this.subscribing = false;
    }
  }
}
