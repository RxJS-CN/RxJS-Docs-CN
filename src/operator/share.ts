import { Observable } from '../Observable';
import { multicast } from './multicast';
import { Subject } from '../Subject';

function shareSubjectFactory() {
  return new Subject();
}

/**
 * 返回一个新的 Observable，该 Observable 多播(分享)源 Observable. 只要至少有一个订阅者并且发出数据. 
 * 当所有的订阅者都取消订阅了它会取消对源 Observable 的订阅. 因为 Observable 是多路传播的它使得流是 `hot`.
 * 它还有别名 .publish().refCount().
 *
 * <img src="./img/share.png" width="100%">
 * @return {Observable<T>} An Observable that upon connection causes the source Observable to emit items to its Observers.
 * @method share
 * @owner Observable
 */
export function share<T>(this: Observable<T>): Observable<T> {
  return multicast.call(this, shareSubjectFactory).refCount();
};
