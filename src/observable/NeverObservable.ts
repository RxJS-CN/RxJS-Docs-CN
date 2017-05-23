import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { noop } from '../util/noop';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class NeverObservable<T> extends Observable<T> {
  /**
   * 创建一个不向观察者发出任何项的 Observable 。
   *
   * <span class="informal">从不发出任何项的 Observable 。</span>
   *
   * <img src="./img/never.png" width="100%">
   *
   * 这个静态操作符对于创建既不发出数据也不触发错误和完成通知的 Observable。 可以用来测试或
   * 者和其他 Observables进行组合。 注意，由于不会发送完成通知，这个 Observable 的 subscription 
   * 不会被自动地清理。Subscriptions 需要手动清理。
   * 
   * @example <caption>发出7, 然后不发出任何值(也不发出完成通知)。</caption>
   * function info() {
   *   console.log('Will not be called');
   * }
   * var result = Rx.Observable.never().startWith(7);
   * result.subscribe(x => console.log(x), info, info);
   *
   * @see {@link create}
   * @see {@link empty}
   * @see {@link of}
   * @see {@link throw}
   *
   * @return {Observable} A "never" Observable:从不发出任何东西的 Observable 。
   * @static true
   * @name never
   * @owner Observable
   */
  static create<T>() {
    return new NeverObservable<T>();
  }

  constructor() {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>): void {
    noop();
  }
}
