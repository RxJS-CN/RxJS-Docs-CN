import { AsyncAction } from './AsyncAction';
import { AsyncScheduler } from './AsyncScheduler';

/**
 *
 * Async 调度器
 *
 * <span class="informal">就像你使用过的 setTimeout(task, duration) 那样调度任务</span>
 *
 * `async` 调度器异步地调度任务，通过将它们放入 JavaScript 事件循环中。它被认为是适时地延时任务或者
 * 按时间间隔重复调度任务的最佳实践。
 *
 * 如果你只是想"延时"任务，即在当前执行同步代码结束后执行它（通常会用`setTimeout(deferredTask, 0)`实现），
 * {@link asap} 调度器会是更好的选择。
 *
 * @example <caption>使用 async 调度器来延时任务</caption>
 * const task = () => console.log('it works!');
 *
 * Rx.Scheduler.async.schedule(task, 2000);
 *
 * // 2秒后的输出:
 * // "it works!"
 *
 *
 * @example <caption>使用 async 调度器按时间间隔重复执行任务</caption>
 * function task(state) {
 *   console.log(state);
 *   this.schedule(state + 1, 1000); // `this` 指向当前执行的 Action,
 *                                   // 我们用新的状态和延时来重新调度它
 * }
 *
 * Rx.Scheduler.async.schedule(task, 3000, 0);
 *
 * // 日志:
 * // 0 after 3s
 * // 1 after 4s
 * // 2 after 5s
 * // 3 after 6s
 *
 * @static true
 * @name async
 * @owner Scheduler
 */

export const async = new AsyncScheduler(AsyncAction);
