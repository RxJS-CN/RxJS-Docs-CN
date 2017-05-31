import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subscription, TeardownLogic } from '../Subscription';

import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 延时源Observable的所有的数据项的发送一个固定的时间段，该时间段由另一个Observable的发送决定.
 *
 * <span class="informal">就像是{@link delay}, 但是延时的时间间隔由第二个Observable决定.</span>
 *
 * <img src="./img/delayWhen.png" width="100%">
 *
 * `delayWhen` 延时发出源Observable的每个值一个由另一个Observable决定的时间段.
 * 当源发出一个数据,`delayDurationSelector`函数将源值当做参数, 返回一个被称为"持续"Observable.
 * 源值被输出Observable发出当且仅当持续发出或者完成.
 *
 * 可选的, `delayWhen` 接受第二个参数, `subscriptionDelay`, 它是一个Observable. 
 * 当`subscriptionDelay`发出第一个值或者完成, 源Observable被订阅并且开始像前一段描
 * 述的一样. 如果`subscriptionDelay`没有提供,`delayWhen` 将会订阅源Observable只
 * 要输出Observable被订阅.
 *
 * @example <caption>延时每个点击事件0到5秒的随机时间</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var delayedClicks = clicks.delayWhen(event =>
 *   Rx.Observable.interval(Math.random() * 5000)
 * );
 * delayedClicks.subscribe(x => console.log(x));
 *
 * @see {@link debounce}
 * @see {@link delay}
 *
 * @param {function(value: T): Observable} delayDurationSelector一个函数接受源Observable
 * 发出的每个值返回一个Observable, 用来延时输出Observable每个数据项的发出直到该函数返回的Observable发出数据.
 * @param {Observable} subscriptionDelay Observable，触发源Observable的订阅一旦它发出数据.
 * @return {Observable} Observable，延时源Observable的发出时间，该时间由`delayDurationSelector`
 * 返回的Observable决定.
 * @method delayWhen
 * @owner Observable
 */
export function delayWhen<T>(this: Observable<T>, delayDurationSelector: (value: T) => Observable<any>,
                             subscriptionDelay?: Observable<any>): Observable<T> {
  if (subscriptionDelay) {
    return new SubscriptionDelayObservable(this, subscriptionDelay)
      .lift(new DelayWhenOperator(delayDurationSelector));
  }
  return this.lift(new DelayWhenOperator(delayDurationSelector));
}

class DelayWhenOperator<T> implements Operator<T, T> {
  constructor(private delayDurationSelector: (value: T) => Observable<any>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new DelayWhenSubscriber(subscriber, this.delayDurationSelector));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DelayWhenSubscriber<T, R> extends OuterSubscriber<T, R> {
  private completed: boolean = false;
  private delayNotifierSubscriptions: Array<Subscription> = [];
  private values: Array<T> = [];

  constructor(destination: Subscriber<T>,
              private delayDurationSelector: (value: T) => Observable<any>) {
    super(destination);
  }

  notifyNext(outerValue: T, innerValue: any,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this.destination.next(outerValue);
    this.removeSubscription(innerSub);
    this.tryComplete();
  }

  notifyError(error: any, innerSub: InnerSubscriber<T, R>): void {
    this._error(error);
  }

  notifyComplete(innerSub: InnerSubscriber<T, R>): void {
    const value = this.removeSubscription(innerSub);
    if (value) {
      this.destination.next(value);
    }
    this.tryComplete();
  }

  protected _next(value: T): void {
    try {
      const delayNotifier = this.delayDurationSelector(value);
      if (delayNotifier) {
        this.tryDelay(delayNotifier, value);
      }
    } catch (err) {
      this.destination.error(err);
    }
  }

  protected _complete(): void {
    this.completed = true;
    this.tryComplete();
  }

  private removeSubscription(subscription: InnerSubscriber<T, R>): T {
    subscription.unsubscribe();

    const subscriptionIdx = this.delayNotifierSubscriptions.indexOf(subscription);
    let value: T = null;

    if (subscriptionIdx !== -1) {
      value = this.values[subscriptionIdx];
      this.delayNotifierSubscriptions.splice(subscriptionIdx, 1);
      this.values.splice(subscriptionIdx, 1);
    }

    return value;
  }

  private tryDelay(delayNotifier: Observable<any>, value: T): void {
    const notifierSubscription = subscribeToResult(this, delayNotifier, value);

    if (notifierSubscription && !notifierSubscription.closed) {
      this.add(notifierSubscription);
      this.delayNotifierSubscriptions.push(notifierSubscription);
    }

    this.values.push(value);
  }

  private tryComplete(): void {
    if (this.completed && this.delayNotifierSubscriptions.length === 0) {
      this.destination.complete();
    }
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SubscriptionDelayObservable<T> extends Observable<T> {
  constructor(protected source: Observable<T>, private subscriptionDelay: Observable<any>) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    this.subscriptionDelay.subscribe(new SubscriptionDelaySubscriber(subscriber, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SubscriptionDelaySubscriber<T> extends Subscriber<T> {
  private sourceSubscribed: boolean = false;

  constructor(private parent: Subscriber<T>, private source: Observable<T>) {
    super();
  }

  protected _next(unused: any) {
    this.subscribeToSource();
  }

  protected _error(err: any) {
    this.unsubscribe();
    this.parent.error(err);
  }

  protected _complete() {
    this.subscribeToSource();
  }

  private subscribeToSource(): void {
    if (!this.sourceSubscribed) {
      this.sourceSubscribed = true;
      this.unsubscribe();
      this.source.subscribe(this.parent);
    }
  }
}
