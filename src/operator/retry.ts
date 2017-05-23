import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';

/**
 * 返回一个 Observable， 该 Observable 是源 Observable 不包含错误异常的镜像。 如果源 Observable 发生错误, 这个方法不会传播错误而是会不
 * 断的重新订阅源 Observable 直到达到最大重试次数 (由数字参数指定)。 
 *
 * <img src="./img/retry.png" width="100%">
 *
 * 任何所有被源 Observable 发出的数据项都会被做为结果的 Observable 发出, 即使这些发送是在失败的订阅期间。 举个例子, 如果一个 Observable 
 * 第一次发送[1, 2]后失败了，紧接着第二次成功的发出: [1, 2, 3, 4, 5]后触发完成， 最后发送流和通知为: [1, 2, 1, 2, 3, 4, 5, `complete`]。
 * @param {number} count - 在失败之前重试的次数。
 * @return {Observable} 使用重试逻辑修改过的源 Observable。
 * @method retry
 * @owner Observable
 */
export function retry<T>(this: Observable<T>, count: number = -1): Observable<T> {
  return this.lift(new RetryOperator(count, this));
}

class RetryOperator<T> implements Operator<T, T> {
  constructor(private count: number,
              private source: Observable<T>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new RetrySubscriber(subscriber, this.count, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class RetrySubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<any>,
              private count: number,
              private source: Observable<T>) {
    super(destination);
  }
  error(err: any) {
    if (!this.isStopped) {
      const { source, count } = this;
      if (count === 0) {
        return super.error(err);
      } else if (count > -1) {
        this.count = count - 1;
      }
      source.subscribe(this._unsubscribeAndRecycle());
    }
  }
}
