import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { PartialObserver } from '../Observer';
import { TeardownLogic } from '../Subscription';

/* tslint:disable:max-line-length */
export function _do<T>(this: Observable<T>, next: (x: T) => void, error?: (e: any) => void, complete?: () => void): Observable<T>;
export function _do<T>(this: Observable<T>, observer: PartialObserver<T>): Observable<T>;
/* tslint:enable:max-line-length */

/**
 * 为源 Observable 上的每次发送执行副作用，但返回的 Observable 与源 Observable 是相同的。
 *
 * <span class="informal">拦截源 Observable 上的每次发送并且运行一个函数，但返回的输出 Observable 与
 * 源 Observable 是相同的，只要不发生错误即可。</span>
 *
 * <img src="./img/do.png" width="100%">
 *
 * 返回源 Observable 的镜像，但镜像是修改过的，以便调用提供的 Observer 来为源 Observable 
 * 发出的每个值，错误和完成执行副作用。在上述的 Observer 或处理方法中抛出的任何错误都可以
 * 安全地发送到输出 Observable 的错误路径中。
 *
 * 此操作符适用于调试 Observables 以查看值是否正确，或者执行一些其他的副作用操作。
 *
 * 注意：此操作符不同于 Observable 的 `subscribe`。如果 `do` 返回的 Observable 没有被订阅，
 * 那么观察者指定的副作用永远不会执行。因此 `do` 只是侦查已存在的执行，它不会像 `subscribe` 
 * 那样触发执行的发生。
 *
 * @example <caption>把每次点击映射成该点击的 clientX ，同时还输出点击事件</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var positions = clicks
 *   .do(ev => console.log(ev))
 *   .map(ev => ev.clientX);
 * positions.subscribe(x => console.log(x));
 *
 * @see {@link map}
 * @see {@link subscribe}
 *
 * @param {Observer|function} [nextOrObserver] 普通的观察者对象或者 `next` 回调函数。
 * @param {function} [error] 源 Observable 的 `error` 回调函数。
 * @param {function} [complete] 源 Observable 的 `complete` 回调函数。
 * @return {Observable} 与源相同的 Observable，但会为每一项的运行指定观察者或回调函数。
 * @method do
 * @name do
 * @owner Observable
 */
export function _do<T>(this: Observable<T>, nextOrObserver?: PartialObserver<T> | ((x: T) => void),
                       error?: (e: any) => void,
                       complete?: () => void): Observable<T> {
  return this.lift(new DoOperator(nextOrObserver, error, complete));
}

class DoOperator<T> implements Operator<T, T> {
  constructor(private nextOrObserver?: PartialObserver<T> | ((x: T) => void),
              private error?: (e: any) => void,
              private complete?: () => void) {
  }
  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new DoSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DoSubscriber<T> extends Subscriber<T> {

  private safeSubscriber: Subscriber<T>;

  constructor(destination: Subscriber<T>,
              nextOrObserver?: PartialObserver<T> | ((x: T) => void),
              error?: (e: any) => void,
              complete?: () => void) {
    super(destination);

    const safeSubscriber = new Subscriber<T>(nextOrObserver, error, complete);
    safeSubscriber.syncErrorThrowable = true;
    this.add(safeSubscriber);
    this.safeSubscriber = safeSubscriber;
  }

  protected _next(value: T): void {
    const { safeSubscriber } = this;
    safeSubscriber.next(value);
    if (safeSubscriber.syncErrorThrown) {
      this.destination.error(safeSubscriber.syncErrorValue);
    } else {
      this.destination.next(value);
    }
  }

  protected _error(err: any): void {
    const { safeSubscriber } = this;
    safeSubscriber.error(err);
    if (safeSubscriber.syncErrorThrown) {
      this.destination.error(safeSubscriber.syncErrorValue);
    } else {
      this.destination.error(err);
    }
  }

  protected _complete(): void {
    const { safeSubscriber } = this;
    safeSubscriber.complete();
    if (safeSubscriber.syncErrorThrown) {
      this.destination.error(safeSubscriber.syncErrorValue);
    } else {
      this.destination.complete();
    }
  }
}
