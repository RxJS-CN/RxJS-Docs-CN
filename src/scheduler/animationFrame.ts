import { AnimationFrameAction } from './AnimationFrameAction';
import { AnimationFrameScheduler } from './AnimationFrameScheduler';

/**
 *
 * 动画帧调度器
 *
 * <span class="informal">当 `window.requestAnimationFrame` 执行的时候触发执行此任务。</span>
 *
 * 当 `animationFrame` 调度器和延时一起使用， 它的行为会回退到 {@link async} 调度器。
 *
 * 如果没有延时, `animationFrame` 调度器可以被用来创建丝滑的浏览器动画。它可以保证在下一次浏览器重绘之前
 * 调度执行任务，从而尽可能高效的执行动画。
 *
 * @example <caption>调度 div 高度的动画</caption>
 * const div = document.querySelector('.some-div');
 *
 * Rx.Scheduler.schedule(function(height) {
 *   div.style.height = height + "px";
 *
 *   this.schedule(height + 1);  // `this` 指向当前正在执行的 Action, 我们用新的状态来重新调度它
 * }, 0, 0);
 *
 * // 你将会看到 .some-div 元素的高度一直增长
 *
 *
 * @static true
 * @name animationFrame
 * @owner Scheduler
 */

export const animationFrame = new AnimationFrameScheduler(AnimationFrameAction);
