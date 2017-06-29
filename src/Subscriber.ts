import { isFunction } from './util/isFunction';
import { Observer, PartialObserver } from './Observer';
import { Subscription } from './Subscription';
import { empty as emptyObserver } from './Observer';
import { rxSubscriber as rxSubscriberSymbol } from './symbol/rxSubscriber';

/**
 * 实现 {@link Observer} 接口并且继承 {@link Subscription} 类。
 * 虽然 {@link Observer} 是消费 {@link Observable} 值的公有 API, 所有 Observers 都转化成了
 * Subscriber，以便提供类似 Subscription 的能力，比如 `unsubscribe`。
 * Subscriber 是 RxJS 的常见类型, 并且是实现操作符的关键, 但是很少作为公有 API
 * 使用。
 *
 * @class Subscriber<T>
 */
export class Subscriber<T> extends Subscription implements Observer<T> {

  [rxSubscriberSymbol]() { return this; }

  /**
   * Subscriber 的静态工厂，给定了 Observer （潜在的部分）的定义。
   * @param {function(x: ?T): void} [next] Observer 的 `next` 回调函数。
   * @param {function(e: ?any): void} [error] Observer 的 `error` 回调函数。
   * @param {function(): void} [complete] Observer 的 `complete` 回调函数。
   * @return {Subscriber<T>} 包装了作为参数传入的（部分定义）Observer 的  Subscriber。
   */
  static create<T>(next?: (x?: T) => void,
                   error?: (e?: any) => void,
                   complete?: () => void): Subscriber<T> {
    const subscriber = new Subscriber(next, error, complete);
    subscriber.syncErrorThrowable = false;
    return subscriber;
  }

  public syncErrorValue: any = null;
  public syncErrorThrown: boolean = false;
  public syncErrorThrowable: boolean = false;

  protected isStopped: boolean = false;
  protected destination: PartialObserver<any>; // this `any` is the escape hatch to erase extra type param (e.g. R)

  /**
   * @param {Observer|function(value: T): void} [destinationOrNext] 部分定义的 Observer 或者 `next` 回调函数。
   * @param {function(e: ?any): void} [error] Observer 的 `error` 回调函数。
   * @param {function(): void} [complete] Observer 的 `complete` 回调函数。
   */
  constructor(destinationOrNext?: PartialObserver<any> | ((value: T) => void),
              error?: (e?: any) => void,
              complete?: () => void) {
    super();

    switch (arguments.length) {
      case 0:
        this.destination = emptyObserver;
        break;
      case 1:
        if (!destinationOrNext) {
          this.destination = emptyObserver;
          break;
        }
        if (typeof destinationOrNext === 'object') {
          if (destinationOrNext instanceof Subscriber) {
            this.destination = (<Subscriber<any>> destinationOrNext);
            (<any> this.destination).add(this);
          } else {
            this.syncErrorThrowable = true;
            this.destination = new SafeSubscriber<T>(this, <PartialObserver<any>> destinationOrNext);
          }
          break;
        }
      default:
        this.syncErrorThrowable = true;
        this.destination = new SafeSubscriber<T>(this, <((value: T) => void)> destinationOrNext, error, complete);
        break;
    }
  }

  /**
   * {@link Observer} 的回调，用来接收 Observable 中的 next 类型通知，此通知带有值。
   * Observable 可能会掉用这个方法 0 次，或者多次。
   * @param {T} [value] The `next` value.
   * @return {void}
   */
  next(value?: T): void {
    if (!this.isStopped) {
      this._next(value);
    }
  }

  /**
   * {@link Observer} 的回调，用来接收 Observable 中的 error 类型通知，此通知带有 {@link Error} 。
   * 通知 Observer，Observable 发出了错误。
   * @param {any} [err] `error` 异常.
   * @return {void}
   */
  error(err?: any): void {
    if (!this.isStopped) {
      this.isStopped = true;
      this._error(err);
    }
  }

  /**
   * {@link Observer}  的回调，用来接收 Observable 中的 `complete` 类型通知。
   * 通知 Observer， Observable 完成了基于推送体系的通知。
   * @return {void}
   */
  complete(): void {
    if (!this.isStopped) {
      this.isStopped = true;
      this._complete();
    }
  }

  unsubscribe(): void {
    if (this.closed) {
      return;
    }
    this.isStopped = true;
    super.unsubscribe();
  }

  protected _next(value: T): void {
    this.destination.next(value);
  }

  protected _error(err: any): void {
    this.destination.error(err);
    this.unsubscribe();
  }

  protected _complete(): void {
    this.destination.complete();
    this.unsubscribe();
  }

  protected _unsubscribeAndRecycle(): Subscriber<T> {
    const { _parent, _parents } = this;
    this._parent = null;
    this._parents = null;
    this.unsubscribe();
    this.closed = false;
    this.isStopped = false;
    this._parent = _parent;
    this._parents = _parents;
    return this;
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SafeSubscriber<T> extends Subscriber<T> {

  private _context: any;

  constructor(private _parentSubscriber: Subscriber<T>,
              observerOrNext?: PartialObserver<T> | ((value: T) => void),
              error?: (e?: any) => void,
              complete?: () => void) {
    super();

    let next: ((value: T) => void);
    let context: any = this;

    if (isFunction(observerOrNext)) {
      next = (<((value: T) => void)> observerOrNext);
    } else if (observerOrNext) {
      next = (<PartialObserver<T>> observerOrNext).next;
      error = (<PartialObserver<T>> observerOrNext).error;
      complete = (<PartialObserver<T>> observerOrNext).complete;
      if (observerOrNext !== emptyObserver) {
        context = Object.create(observerOrNext);
        if (isFunction(context.unsubscribe)) {
          this.add(<() => void> context.unsubscribe.bind(context));
        }
        context.unsubscribe = this.unsubscribe.bind(this);
      }
    }

    this._context = context;
    this._next = next;
    this._error = error;
    this._complete = complete;
  }

  next(value?: T): void {
    if (!this.isStopped && this._next) {
      const { _parentSubscriber } = this;
      if (!_parentSubscriber.syncErrorThrowable) {
        this.__tryOrUnsub(this._next, value);
      } else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
        this.unsubscribe();
      }
    }
  }

  error(err?: any): void {
    if (!this.isStopped) {
      const { _parentSubscriber } = this;
      if (this._error) {
        if (!_parentSubscriber.syncErrorThrowable) {
          this.__tryOrUnsub(this._error, err);
          this.unsubscribe();
        } else {
          this.__tryOrSetError(_parentSubscriber, this._error, err);
          this.unsubscribe();
        }
      } else if (!_parentSubscriber.syncErrorThrowable) {
        this.unsubscribe();
        throw err;
      } else {
        _parentSubscriber.syncErrorValue = err;
        _parentSubscriber.syncErrorThrown = true;
        this.unsubscribe();
      }
    }
  }

  complete(): void {
    if (!this.isStopped) {
      const { _parentSubscriber } = this;
      if (this._complete) {
        const wrappedComplete = () => this._complete.call(this._context);

        if (!_parentSubscriber.syncErrorThrowable) {
          this.__tryOrUnsub(wrappedComplete);
          this.unsubscribe();
        } else {
          this.__tryOrSetError(_parentSubscriber, wrappedComplete);
          this.unsubscribe();
        }
      } else {
        this.unsubscribe();
      }
    }
  }

  private __tryOrUnsub(fn: Function, value?: any): void {
    try {
      fn.call(this._context, value);
    } catch (err) {
      this.unsubscribe();
      throw err;
    }
  }

  private __tryOrSetError(parent: Subscriber<T>, fn: Function, value?: any): boolean {
    try {
      fn.call(this._context, value);
    } catch (err) {
      parent.syncErrorValue = err;
      parent.syncErrorThrown = true;
      return true;
    }
    return false;
  }

  protected _unsubscribe(): void {
    const { _parentSubscriber } = this;
    this._context = null;
    this._parentSubscriber = null;
    _parentSubscriber.unsubscribe();
  }
}
