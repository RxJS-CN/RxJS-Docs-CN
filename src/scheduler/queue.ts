import { QueueAction } from './QueueAction';
import { QueueScheduler } from './QueueScheduler';

/**
 *
 * 队列调度器
 *
 * <span class="informal">将每个任务都放到队列里，而不是立刻执行它们</span>
 *
 * `queue` 调度器, 当和延时一起使用的时候, 和 {@link async} 调度器行为一样。
 *
 * 当和延时一起使用， 它同步地调用当前任务，即调度的时候执行。然而当递归调用的时候，即在调度的任务内，
 * 另一个任务由调度队列调度，而不是立即执行，该任务将被放在队列中，等待当前一个完成。
 * 
 * 这意味着当你用 `queue` 调度程序执行任务时，你确信它会在调度程序启动之前的任何其他任务结束之前结束。
 *
 * @examples <caption>首先递归调度, 然后做一些事情</caption>
 *
 * Rx.Scheduler.queue.schedule(() => {
 *   Rx.Scheduler.queue.schedule(() => console.log('second')); // 不会立马执行，但是会放到队列里
 *
 *   console.log('first');
 * });
 *
 * // 日志:
 * // "first"
 * // "second"
 *
 *
 * @example <caption>递归的重新调度自身</caption>
 *
 * Rx.Scheduler.queue.schedule(function(state) {
 *   if (state !== 0) {
 *     console.log('before', state);
 *     this.schedule(state - 1); // `this` 指向当前执行的 Action,
 *                               // 我们使用新的状态重新调度
 *     console.log('after', state);
 *   }
 * }, 0, 3);
 *
 * // 递归运行的调度器， 你的期望:
 * // "before", 3
 * // "before", 2
 * // "before", 1
 * // "after", 1
 * // "after", 2
 * // "after", 3
 *
 * // 但实际使用队列的输入:
 * // "before", 3
 * // "after", 3
 * // "before", 2
 * // "after", 2
 * // "before", 1
 * // "after", 1
 *
 *
 * @static true
 * @name queue
 * @owner Scheduler
 */

export const queue = new QueueScheduler(QueueAction);
