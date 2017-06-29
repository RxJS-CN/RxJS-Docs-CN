import { isArray } from './util/isArray';
import { isObject } from './util/isObject';
import { isFunction } from './util/isFunction';
import { tryCatch } from './util/tryCatch';
import { errorObject } from './util/errorObject';
import { UnsubscriptionError } from './util/UnsubscriptionError';

export interface AnonymousSubscription {
  unsubscribe(): void;
}

export type TeardownLogic = AnonymousSubscription | Function | void;

export interface ISubscription extends AnonymousSubscription {
  unsubscribe(): void;
  readonly closed: boolean;
}

/**
 * 表示可清理的资源，比如 Observable 的执行。Subscription 有一个重要的方法，`unsubscribe`，
 * 该方法不接受参数并且清理该 subscription 持有的资源。
 *
 * 另外，subscriptions 可以通过 `add()` 方法进行分组，即可以给当前 Subscription 添加子 Subscription。
 * 当 Subscription 被取消订阅，它所有的子孙 Subscription 都会被取消订阅。
 *
 * @class Subscription
 */
export class Subscription implements ISubscription {
  public static EMPTY: Subscription = (function(empty: any){
    empty.closed = true;
    return empty;
  }(new Subscription()));

  /**
   * 用来标示该 Subscription 是否被取消订阅的标示位。
   * @type {boolean}
   */
  public closed: boolean = false;

  protected _parent: Subscription = null;
  protected _parents: Subscription[] = null;
  private _subscriptions: ISubscription[] = null;

  /**
   * @param {function(): void} [unsubscribe] 描述 `unsubscribe` 方法被调用时该如何执行资源清理的函数。
   */
  constructor(unsubscribe?: () => void) {
    if (unsubscribe) {
      (<any> this)._unsubscribe = unsubscribe;
    }
  }

  /**
   * 清理 subscription 持有的资源。例如，可以取消正在进行的 Observable 执行或取消在创建 Subscription 时启动的任何其他类型的工作。
   * @return {void}
   */
  unsubscribe(): void {
    let hasErrors = false;
    let errors: any[];

    if (this.closed) {
      return;
    }

    let { _parent, _parents, _unsubscribe, _subscriptions } = (<any> this);

    this.closed = true;
    this._parent = null;
    this._parents = null;
    // null out _subscriptions first so any child subscriptions that attempt
    // to remove themselves from this subscription will noop
    this._subscriptions = null;

    let index = -1;
    let len = _parents ? _parents.length : 0;

    // if this._parent is null, then so is this._parents, and we
    // don't have to remove ourselves from any parent subscriptions.
    while (_parent) {
      _parent.remove(this);
      // if this._parents is null or index >= len,
      // then _parent is set to null, and the loop exits
      _parent = ++index < len && _parents[index] || null;
    }

    if (isFunction(_unsubscribe)) {
      let trial = tryCatch(_unsubscribe).call(this);
      if (trial === errorObject) {
        hasErrors = true;
        errors = errors || (
          errorObject.e instanceof UnsubscriptionError ?
            flattenUnsubscriptionErrors(errorObject.e.errors) : [errorObject.e]
        );
      }
    }

    if (isArray(_subscriptions)) {

      index = -1;
      len = _subscriptions.length;

      while (++index < len) {
        const sub = _subscriptions[index];
        if (isObject(sub)) {
          let trial = tryCatch(sub.unsubscribe).call(sub);
          if (trial === errorObject) {
            hasErrors = true;
            errors = errors || [];
            let err = errorObject.e;
            if (err instanceof UnsubscriptionError) {
              errors = errors.concat(flattenUnsubscriptionErrors(err.errors));
            } else {
              errors.push(err);
            }
          }
        }
      }
    }

    if (hasErrors) {
      throw new UnsubscriptionError(errors);
    }
  }

  /**
   * 添加一个 tear down 在该 Subscription 的  unsubscribe() 期间调用。
   *
   * 如果清理是在已取消订阅的 subscription 时候添加的，那么它和 add 正在调用的引用是同一个，
   * 或者是 `Subscription.EMPTY`， 它都不会被添加。
   *
   * 如果该 subscription 已经在 `closed` 状态，传入的清理逻辑将会立即执行。
   *
   * @param {TeardownLogic} teardown 执行清理程序时的附加逻辑。
   * @return {Subscription} 返回用于创建或添加到内部 Subscription 列表中的 Subscription。
   * 该 Subscription 可以使用 `remove()` 删除内部的 subscriptions 列表中传入的清理逻辑。
   */
  add(teardown: TeardownLogic): Subscription {
    if (!teardown || (teardown === Subscription.EMPTY)) {
      return Subscription.EMPTY;
    }

    if (teardown === this) {
      return this;
    }

    let subscription = (<Subscription> teardown);

    switch (typeof teardown) {
      case 'function':
        subscription = new Subscription(<(() => void) > teardown);
      case 'object':
        if (subscription.closed || typeof subscription.unsubscribe !== 'function') {
          return subscription;
        } else if (this.closed) {
          subscription.unsubscribe();
          return subscription;
        } else if (typeof subscription._addParent !== 'function' /* quack quack */) {
          const tmp = subscription;
          subscription = new Subscription();
          subscription._subscriptions = [tmp];
        }
        break;
      default:
        throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
    }

    const subscriptions = this._subscriptions || (this._subscriptions = []);

    subscriptions.push(subscription);
    subscription._addParent(this);

    return subscription;
  }

  /**
   * 从 Subscription 的内部列表中删除一个 Subscription。在该 Subscription 取消订阅的过程中
   * 取消订阅。
   * @param {Subscription} subscription 被移除的 subscription。
   * @return {void}
   */
  remove(subscription: Subscription): void {
    const subscriptions = this._subscriptions;
    if (subscriptions) {
      const subscriptionIndex = subscriptions.indexOf(subscription);
      if (subscriptionIndex !== -1) {
        subscriptions.splice(subscriptionIndex, 1);
      }
    }
  }

  private _addParent(parent: Subscription) {
    let { _parent, _parents } = this;
    if (!_parent || _parent === parent) {
      // If we don't have a parent, or the new parent is the same as the
      // current parent, then set this._parent to the new parent.
      this._parent = parent;
    } else if (!_parents) {
      // If there's already one parent, but not multiple, allocate an Array to
      // store the rest of the parent Subscriptions.
      this._parents = [parent];
    } else if (_parents.indexOf(parent) === -1) {
      // Only add the new parent to the _parents list if it's not already there.
      _parents.push(parent);
    }
  }
}

function flattenUnsubscriptionErrors(errors: any[]) {
 return errors.reduce((errs, err) => errs.concat((err instanceof UnsubscriptionError) ? err.errors : err), []);
}
