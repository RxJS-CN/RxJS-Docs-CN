import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';

import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 缓冲源Observable的值直到`closingNotifier`发出.
 *
 * <span class="informal">将值收集到数组里, 直到另一个Observable发送才发出
 * 该数组.</span>
 *
 * <img src="./img/buffer.png" width="100%">
 *
 * 将Observable发出的值缓冲起来直到`closingNotifier`发出数据, 在这个时刻输出
 * Observable发出该缓冲区的值并且内部开启一个新的缓冲区, 等待下一个`closingNotifier`的发送.
 *
 * @example <caption>每次点击事件后发出一个从间隔收集的数组</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var interval = Rx.Observable.interval(1000);
 * var buffered = interval.buffer(clicks);
 * buffered.subscribe(x => console.log(x));
 *
 * @see {@link bufferCount}
 * @see {@link bufferTime}
 * @see {@link bufferToggle}
 * @see {@link bufferWhen}
 * @see {@link window}
 *
 * @param {Observable<any>} closingNotifier Observable发出输出Observable发出缓冲的信号.
 * @return {Observable<T[]>} 数组缓冲的Observable.
 * @method buffer
 * @owner Observable
 */
export function buffer<T>(this: Observable<T>, closingNotifier: Observable<any>): Observable<T[]> {
  return this.lift(new BufferOperator<T>(closingNotifier));
}

class BufferOperator<T> implements Operator<T, T[]> {

  constructor(private closingNotifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T[]>, source: any): any {
    return source.subscribe(new BufferSubscriber(subscriber, this.closingNotifier));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class BufferSubscriber<T> extends OuterSubscriber<T, any> {
  private buffer: T[] = [];

  constructor(destination: Subscriber<T[]>, closingNotifier: Observable<any>) {
    super(destination);
    this.add(subscribeToResult(this, closingNotifier));
  }

  protected _next(value: T) {
    this.buffer.push(value);
  }

  notifyNext(outerValue: T, innerValue: any,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, any>): void {
    const buffer = this.buffer;
    this.buffer = [];
    this.destination.next(buffer);
  }
}
