import { Action } from './scheduler/Action';
import { Subscription } from './Subscription';

export interface IScheduler {
  now(): number;
  schedule<T>(work: (this: Action<T>, state?: T) => void, delay?: number, state?: T): Subscription;
}
/**
 * 用来安排任务并调度执行的执行上下文和数据结构。通过获取方法 `now()` 提供
 * 虚拟时间的概念。
 *
 * 调度器的每个工作单元被称为 {@link Action}.
 *
 * ```ts
 * class Scheduler {
 *   now(): number;
 *   schedule(work, delay?, state?): Subscription;
 * }
 * ```
 *
 * @class Scheduler
 */
export class Scheduler implements IScheduler {

  public static now: () => number = Date.now ? Date.now : () => +new Date();

  constructor(private SchedulerAction: typeof Action,
              now: () => number = Scheduler.now) {
    this.now = now;
  }

  /**
   * 获取方法，返回的数字表示取决于调度器的内部时钟的当前时间(该方法被调用的时刻)。
   * @return {number} 代表当前时间的数字。可能与真实时间有关，或者无关。
   * 可能指的是单位时间(例如，毫秒)，或者不是。
   */
  public now: () => number;

  /**
   * 调度并执行 `work` 函数。如果指定了 `delay` 参数，那么根据此参数可能会在未来某个时间点发生。
   * 可以传递一些上下文对象，`state`，该对象将会被传递给 `work` 函数。
   * 给定的参数将作为一个动作对象存储在一个行动队列。
   *
   * @param {function(state: ?T): ?Subscription} work 代表任务的函数，或者某些可以被调度器执行
   * 的工作单元。
   * @param {number} [delay] 在执行任务之前的等待时间，时间单位是隐式的，由调度器本身定义。
   * @param {T} [state] 当调度器调用 `work` 函数时使用时的一些上下文数据。
   * @return {Subscription} 该 subscription 是为了能够退订已调度工作。
   */
  public schedule<T>(work: (this: Action<T>, state?: T) => void, delay: number = 0, state?: T): Subscription {
    return new this.SchedulerAction<T>(this, work).schedule(state, delay);
  }
}
