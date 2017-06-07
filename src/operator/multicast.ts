import { Subject } from '../Subject';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { ConnectableObservable, connectableObservableDescriptor } from '../observable/ConnectableObservable';

/* tslint:disable:max-line-length */
export function multicast<T>(this: Observable<T>, subjectOrSubjectFactory: factoryOrValue<Subject<T>>): ConnectableObservable<T>;
export function multicast<T>(SubjectFactory: (this: Observable<T>) => Subject<T>, selector?: selector<T>): Observable<T>;
/* tslint:enable:max-line-length */

/**
 * 返回的 Observable 发出对 ConnectableObservable 发出的项调用一个指定的 selector 函数的结果，
 * ConnectableObservable 可以在潜在的多个流之间共享单个 subscription 。
 *
 * <img src="./img/multicast.png" width="100%">
 *
 * @param {Function|Subject} subjectOrSubjectFactory - 用来创建中间 Subject 的工厂函数，源序列的元素将通过
 * 该 Subject 多播到 selector函数，或者将元素推入该 Subject 。
 * @param {Function} [selector] - 可选的选择器函数，可以根据需要多次使用以多播源流，而不会导致源流
 * 生成多个 subscriptions 。给定源的订阅者会从订阅开始的一刻起，接收源的所有通知。
 * @return {Observable} 该 Observable 发出对 ConnectableObservable 发出的项调用 selector 函数的结果，
 * ConnectableObservable 可以在潜在的多个流之间共享单个 subscription 。
 * @method multicast
 * @owner Observable
 */
export function multicast<T>(this: Observable<T>, subjectOrSubjectFactory: Subject<T> | (() => Subject<T>),
                             selector?: (source: Observable<T>) => Observable<T>): Observable<T> | ConnectableObservable<T> {
  let subjectFactory: () => Subject<T>;
  if (typeof subjectOrSubjectFactory === 'function') {
    subjectFactory = <() => Subject<T>>subjectOrSubjectFactory;
  } else {
    subjectFactory = function subjectFactory() {
      return <Subject<T>>subjectOrSubjectFactory;
    };
  }

  if (typeof selector === 'function') {
    return this.lift(new MulticastOperator(subjectFactory, selector));
  }

  const connectable: any = Object.create(this, connectableObservableDescriptor);
  connectable.source = this;
  connectable.subjectFactory = subjectFactory;

  return <ConnectableObservable<T>> connectable;
}

export type factoryOrValue<T> = T | (() => T);
export type selector<T> = (source: Observable<T>) => Observable<T>;

export class MulticastOperator<T> implements Operator<T, T> {
  constructor(private subjectFactory: () => Subject<T>,
              private selector: (source: Observable<T>) => Observable<T>) {
  }
  call(subscriber: Subscriber<T>, source: any): any {
    const { selector } = this;
    const subject = this.subjectFactory();
    const subscription = selector(subject).subscribe(subscriber);
    subscription.add(source.subscribe(subject));
    return subscription;
  }
}
