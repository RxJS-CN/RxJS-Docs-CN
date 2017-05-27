import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';

/**
 * 将给定的 `project` 函数应用于源 Observable 发出的每个值，并将结果值作为 
 * Observable 发出。
 *
 * <span class="informal">类似于 [Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)，
 * 它把每个源值传递给转化函数以获得相应的输出值。</span>
 *
 * <img src="./img/map.png" width="100%">
 *
 * 类似于大家所熟知的 `Array.prototype.map` 方法，此操作符将投射函数应用于每个值
 * 并且在输出 Observable 中发出投射后的结果。
 *
 * @example <caption>将每次点击映射为这次点击的 clientX </caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var positions = clicks.map(ev => ev.clientX);
 * positions.subscribe(x => console.log(x));
 *
 * @see {@link mapTo}
 * @see {@link pluck}
 *
 * @param {function(value: T, index: number): R} project 应用于由源 Observable 
 * 所发出的每个值的函数。`index` 参数是自订阅开始后发送序列的索引，是从 `0` 开始的。
 * @param {any} [thisArg] 可选参数，定义在 `project` 函数中的 `this` 是什么。
 * @return {Observable<R>} 该 Observable 发出源 Observable 中经过给定的 `project` 
 * 函数转换的值。
 * @method map
 * @owner Observable
 */
export function map<T, R>(this: Observable<T>, project: (value: T, index: number) => R, thisArg?: any): Observable<R> {
  if (typeof project !== 'function') {
    throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
  }
  return this.lift(new MapOperator(project, thisArg));
}

export class MapOperator<T, R> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => R, private thisArg: any) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class MapSubscriber<T, R> extends Subscriber<T> {
  count: number = 0;
  private thisArg: any;

  constructor(destination: Subscriber<R>,
              private project: (value: T, index: number) => R,
              thisArg: any) {
    super(destination);
    this.thisArg = thisArg || this;
  }

  // NOTE: This looks unoptimized, but it's actually purposefully NOT
  // using try/catch optimizations.
  protected _next(value: T) {
    let result: any;
    try {
      result = this.project.call(this.thisArg, value, this.count++);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
  }
}
