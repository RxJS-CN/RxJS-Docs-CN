import { PartialObserver } from './Observer';
import { Observable } from './Observable';

/**
 * 代表一个可以被 {@link Observable} 发出的基于推送的事件或者值。对于像 {@link materialize}，
 *  {@link dematerialize}， {@link observeOn} 和其他管理通知的操作符来说，这类尤其适用。
 * 除了包装真正发出的值，它还使用，例如，推送的类型（`next`，`error`， or `complete`）等元数据
 * 装饰它。
 *
 * @see {@link materialize}
 * @see {@link dematerialize}
 * @see {@link observeOn}
 *
 * @class Notification<T>
 */
export class Notification<T> {
  hasValue: boolean;

  constructor(public kind: string, public value?: T, public error?: any) {
    this.hasValue = kind === 'N';
  }

  /**
   * 传递给给定的 `observer` 这个通知包装过的值。
   * @param {Observer} observer
   * @return
   */
  observe(observer: PartialObserver<T>): any {
    switch (this.kind) {
      case 'N':
        return observer.next && observer.next(this.value);
      case 'E':
        return observer.error && observer.error(this.error);
      case 'C':
        return observer.complete && observer.complete();
    }
  }

  /**
   * 给定一些 {@link Observer} 回调函数， 将当前通知所表示的值传递给正确的对应回调函数。
   * @param {function(value: T): void} next Observer 的 `next` 回调函数。
   * @param {function(err: any): void} [error] Observer 的 `error` 回调函数。
   * @param {function(): void} [complete] An Observer 的 `complete` 回调函数。
   * @return {any}
   */
  do(next: (value: T) => void, error?: (err: any) => void, complete?: () => void): any {
    const kind = this.kind;
    switch (kind) {
      case 'N':
        return next && next(this.value);
      case 'E':
        return error && error(this.error);
      case 'C':
        return complete && complete();
    }
  }

  /**
   * 接受一个 Observer 或者它的回调函数，然后相应的调用 `observe` 或者 `do` 方法。 
   * @param {Observer|function(value: T): void} nextOrObserver  Observer 或者
   * `next` 回调函数。
   * @param {function(err: any): void} [error] Observer 的 `error` 回调函数。
   * @param {function(): void} [complete] Observer 的 `complete` 回调函数。
   * @return {any}
   */
  accept(nextOrObserver: PartialObserver<T> | ((value: T) => void), error?: (err: any) => void, complete?: () => void) {
    if (nextOrObserver && typeof (<PartialObserver<T>>nextOrObserver).next === 'function') {
      return this.observe(<PartialObserver<T>>nextOrObserver);
    } else {
      return this.do(<(value: T) => void>nextOrObserver, error, complete);
    }
  }

  /**
   * 返回一个仅仅发出由该通知实例表示的通知的简单 Observable。
   * @return {any}
   */
  toObservable(): Observable<T> {
    const kind = this.kind;
    switch (kind) {
      case 'N':
        return Observable.of(this.value);
      case 'E':
        return Observable.throw(this.error);
      case 'C':
        return Observable.empty<T>();
    }
    throw new Error('unexpected notification kind value');
  }

  private static completeNotification: Notification<any> = new Notification('C');
  private static undefinedValueNotification: Notification<any> = new Notification('N', undefined);

  /**
   * 使用给定的值创建一个`next`型通知实例的快捷方法。
   * @param {T} value `next` 的值。
   * @return {Notification<T>} 代表传入值的`next`型通知实例。
   */
  static createNext<T>(value: T): Notification<T> {
    if (typeof value !== 'undefined') {
      return new Notification('N', value);
    }
    return this.undefinedValueNotification;
  }

  /**
   * 使用给定的错误对象创建一个`error`型通知实例的快捷方法。
   * @param {any} [err]  `error` 错误。
   * @return {Notification<T>} 代表传入错误的`error`型通知实例。
   */
  static createError<T>(err?: any): Notification<T> {
    return new Notification('E', undefined, err);
  }

  /**
   * 创建一个`complete`型通知实例的快捷方法。
   * @return {Notification<any>} 没有值的`complete`型的通知。
   */
  static createComplete(): Notification<any> {
    return this.completeNotification;
  }
}
