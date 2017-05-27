import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable, SubscribableOrPromise } from '../Observable';
import { Subscription } from '../Subscription';

import { subscribeToResult } from '../util/subscribeToResult';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';

/**
 *  缓冲源Observable的值，`openings`发送的时候开始缓冲，`closingSelector`发送的时候结束缓冲.
 *
 * <span class="informal">将历史数据收集到数组中. 当`opening`发送的时候开始收集, 然后调用`closingSelector`
 * 函数获取Observable，该Observable告知什么时候关闭缓冲.</span>
 *
 * <img src="./img/bufferToggle.png" width="100%">
 *
 * 缓冲源Observable的值，当`openings`Observable发出信号的时候开始缓冲数据, 当`closingSelector`返回的Subscribable
 * 或者Promise发送的时候结束并且发送缓冲区.
 *
 * @example <caption>在每一秒, 在接下来的500ms发送点击事件</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var openings = Rx.Observable.interval(1000);
 * var buffered = clicks.bufferToggle(openings, i =>
 *   i % 2 ? Rx.Observable.interval(500) : Rx.Observable.empty()
 * );
 * buffered.subscribe(x => console.log(x));
 *
 * @see {@link buffer}
 * @see {@link bufferCount}
 * @see {@link bufferTime}
 * @see {@link bufferWhen}
 * @see {@link windowToggle}
 *
 * @param {SubscribableOrPromise<O>} openings 一个可以别订阅的或者Promise负责通知何时开启缓冲区.
 * @param {function(value: O): SubscribableOrPromise} 关闭选择器，接受`openings`observable
 * 发出的数据返回一个可以被订阅的对象或者Promise的函数,不管何时发出相关联的缓冲区被发送.
 * @return {Observable<T[]>} 缓冲数组的observable.
 * @method bufferToggle
 * @owner Observable
 */
export function bufferToggle<T, O>(this: Observable<T>, openings: SubscribableOrPromise<O>,
                                   closingSelector: (value: O) => SubscribableOrPromise<any>): Observable<T[]> {
  return this.lift(new BufferToggleOperator<T, O>(openings, closingSelector));
}

class BufferToggleOperator<T, O> implements Operator<T, T[]> {

  constructor(private openings: SubscribableOrPromise<O>,
              private closingSelector: (value: O) => SubscribableOrPromise<any>) {
  }

  call(subscriber: Subscriber<T[]>, source: any): any {
    return source.subscribe(new BufferToggleSubscriber(subscriber, this.openings, this.closingSelector));
  }
}

interface BufferContext<T> {
  buffer: T[];
  subscription: Subscription;
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class BufferToggleSubscriber<T, O> extends OuterSubscriber<T, O> {
  private contexts: Array<BufferContext<T>> = [];

  constructor(destination: Subscriber<T[]>,
              private openings: SubscribableOrPromise<O>,
              private closingSelector: (value: O) => SubscribableOrPromise<any> | void) {
    super(destination);
    this.add(subscribeToResult(this, openings));
  }

  protected _next(value: T): void {
    const contexts = this.contexts;
    const len = contexts.length;
    for (let i = 0; i < len; i++) {
      contexts[i].buffer.push(value);
    }
  }

  protected _error(err: any): void {
    const contexts = this.contexts;
    while (contexts.length > 0) {
      const context = contexts.shift();
      context.subscription.unsubscribe();
      context.buffer = null;
      context.subscription = null;
    }
    this.contexts = null;
    super._error(err);
  }

  protected _complete(): void {
    const contexts = this.contexts;
    while (contexts.length > 0) {
      const context = contexts.shift();
      this.destination.next(context.buffer);
      context.subscription.unsubscribe();
      context.buffer = null;
      context.subscription = null;
    }
    this.contexts = null;
    super._complete();
  }

  notifyNext(outerValue: any, innerValue: O,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, O>): void {
    outerValue ? this.closeBuffer(outerValue) : this.openBuffer(innerValue);
  }

  notifyComplete(innerSub: InnerSubscriber<T, O>): void {
    this.closeBuffer((<any> innerSub).context);
  }

  private openBuffer(value: O): void {
    try {
      const closingSelector = this.closingSelector;
      const closingNotifier = closingSelector.call(this, value);
      if (closingNotifier) {
        this.trySubscribe(closingNotifier);
      }
    } catch (err) {
      this._error(err);
    }
  }

  private closeBuffer(context: BufferContext<T>): void {
    const contexts = this.contexts;

    if (contexts && context) {
      const { buffer, subscription } = context;
      this.destination.next(buffer);
      contexts.splice(contexts.indexOf(context), 1);
      this.remove(subscription);
      subscription.unsubscribe();
    }
  }

  private trySubscribe(closingNotifier: any): void {
    const contexts = this.contexts;

    const buffer: Array<T> = [];
    const subscription = new Subscription();
    const context = { buffer, subscription };
    contexts.push(context);

    const innerSubscription = subscribeToResult(this, closingNotifier, <any>context);

    if (!innerSubscription || innerSubscription.closed) {
      this.closeBuffer(context);
    } else {
      (<any> innerSubscription).context = context;

      this.add(innerSubscription);
      subscription.add(innerSubscription);
    }
  }
}
