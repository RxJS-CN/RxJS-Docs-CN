import { Scheduler } from '../Scheduler';
import { Subscription } from '../Subscription';

/**
 * 在调度器（{@link Scheduler}）中要执行的任务单元。action 通常是在调度器内部创建，并且 RxJS 用户
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
   * 在它的父调度器上来调度此 action 的执行。可以传递一下上下文对象，`state`。如果指定了
   * `delay`参数，可能会在未来的某一点发生。
   * @param {T} [state] `work` 函数在被调度器调用时可以使用的一些上下文数据。
   * @param {number} [delay] 在执行任务之前的等待时间，时间单元是隐式的，由调度器定义。
   * @return {void}
   */
  public schedule(state?: T, delay: number = 0): Subscription {
    return this;
  }
}
