import { Observable } from '../Observable';
import { multicast } from './multicast';
import { Subject } from '../Subject';

function shareSubjectFactory() {
  return new Subject();
}

/**
 * 返回一个新的 Observable，该 Observable 多播(共享)源 Observable。 至少要有一个订阅者，该 Observable 才会被订阅并发出数据。 
 * 当所有的订阅者都取消订阅了，它会取消对源 Observable 的订阅。 因为 Observable 是多路传播的它使得流是 `hot`。
 * 它是 ｀.publish().refCount()｀ 的别名。
 *
 * <img src="./img/share.png" width="100%">
 * @return {Observable<T>} Observable，连接该 Observable 后会导致源 Observable 向它的观察者发送数据。
 * @method share
 * @owner Observable
 */
export function share<T>(this: Observable<T>): Observable<T> {
  return multicast.call(this, shareSubjectFactory).refCount();
};
