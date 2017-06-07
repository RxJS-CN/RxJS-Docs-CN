import { Scheduler } from '../Scheduler';
import { Subscription } from '../Subscription';

/**
 * 在{@link Scheduler}中执行的任务单元。action 通常是由 Scheduler 内部创建，并且 RxJS 用户
 * 不需要关注它的创建和维护。
 *
 * ```ts
 * class Action<T> extends Subscription {
 *   new (scheduler: Scheduler, work: (state?: T) => void);
 *   schedule(state?: T, delay: number = 0): Subscription;
 * }
 * ```
 *
 * @class Action<T>
 */
export class Action<T> extends Subscription {
  constructor(scheduler: Scheduler, work: (this: Action<T>, state?: T) => void) {
    super();
  }
  /**
   * 将此 action 的调度在其父 Scheduler 中执行。可以传递一下上下文对象，`state`。如果指定了
   * `delay`参数，可能会在未来的某一点发生。
   * @param {T} [state] `work`函数在 Scheduler 调用时可以使用的一些上下文数据。
   * @param {number} [delay] 在执行任务之前的等待时间，时间单元是隐式的，由 Scheduler 定义。
   * @return {void}
   */
  public schedule(state?: T, delay: number = 0): Subscription {
    return this;
  }
}
