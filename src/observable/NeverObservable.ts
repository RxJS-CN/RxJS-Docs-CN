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
   * 创建一个不返回任何数据项的Observer.
   *
   * <span class="informal">一个不返回任何数据项的Observer.</span>
   *
   * <img src="./img/never.png" width="100%">
   *
   * 这个静态操作符对于创建既不发出数据也不触发错误和完成通知的Observable. 可以用来测试或
   * 者和其他Observables进行组合. 注意，由于用于不会发送完成通知,这个Observable一致保持
   * 着订阅. 订阅需要手动的解除.
   *
   * @example <caption>发出7, 然后不发出任何值(也不发出完成通知).</caption>
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
   * @return {Observable} A "never" Observable: 永远不发出数据.
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
