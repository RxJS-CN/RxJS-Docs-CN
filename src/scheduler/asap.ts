import { AsapAction } from './AsapAction';
import { AsapScheduler } from './AsapScheduler';

/**
 *
 * Asap 调度器
 *
 * <span class="informal">尽可能快的异步执行任务</span>
 *
 * 当你用它来延时任务的时候，`asap` 调度器的行为和 {@link async} 一样。如果你将延时时间设置为 `0`，
 * `asap` 会等待当前同步执行结束然后立刻执行当前任务。
 *
 * `asap` 会尽全力最小化当前执行栈和开始调度任务的时间。这使得它成为执行“deferring”的最佳候选人。以前，可以通过
 * 调用 `setTimeout(deferredTask, 0)` 来做到，但是这种方式仍热包含一些非期望的延时。
 *
 * 注意，使用 `asap` 调度器并不一定意味着你的任务将会在当前执行栈后第一个执行。特别的，如果之前有其他`asap`调度器的
 * 任务，该任务会首先执行。也就是说，如果你需要异步调用任务，但是尽可能快的执行，`asap`调度器是你最好的选择。
 *
 * @example <caption>比较 async 和 asap 调度器</caption>
 *
 * Rx.Scheduler.async.schedule(() => console.log('async')); // scheduling 'async' first...
 * Rx.Scheduler.asap.schedule(() => console.log('asap'));
 *
 * // 日志:
 * // "asap"
 * // "async"
 * // ... but 'asap' goes first!
 *
 * @static true
 * @name asap
 * @owner Scheduler
 */

export const asap = new AsapScheduler(AsapAction);
