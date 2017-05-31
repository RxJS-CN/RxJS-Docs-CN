import { Subject } from '../Subject';
import { Observable } from '../Observable';
import { multicast } from './multicast';
import { ConnectableObservable } from '../observable/ConnectableObservable';

/* tslint:disable:max-line-length */
export function publish<T>(this: Observable<T>): ConnectableObservable<T>;
export function publish<T>(this: Observable<T>, selector: selector<T>): Observable<T>;
/* tslint:enable:max-line-length */

/**
 * 返回 ConnectableObservable，它是 Observable 的变种，它会一直等待 connnect 方法被调用才会开始把值发送给那些订阅它的观察者。
 *
 * <img src="./img/publish.png" width="100%">
 *
 * @param {Function} [selector] - 可选的选择器函数，可以根据需要多次使用以多播源序列，而不会导致源序列
 * 生成多个 subscriptions 。给定源的订阅者会从订阅开始的一刻起，接收源的所有通知。
 * @return ConnectableObservable，一旦连接，源 Observable 便会向它的观察者发出项。
 * @method publish
 * @owner Observable
 */
export function publish<T>(this: Observable<T>, selector?: (source: Observable<T>) => Observable<T>): Observable<T> | ConnectableObservable<T> {
  return selector ? multicast.call(this, () => new Subject<T>(), selector) :
                    multicast.call(this, new Subject<T>());
}

export type selector<T> = (source: Observable<T>) => Observable<T>;
