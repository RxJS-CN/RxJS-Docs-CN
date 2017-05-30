import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';

/**
 * 将一系列连续的发送成对的组合在一起，并将这些分组作为两个值的数组发出。
 *
 * <span class="informal">将当前值和前一个值作为数组放在一起，然后将其发出。</span>
 *
 * <img src="./img/pairwise.png" width="100%">
 *
 * 源 Observable 的第N个发送会使输出 Observable 发出一个数组 [(N-1)th, Nth]，即前一个
 * 值和当前值的数组，它们作为一对。出于这个原因，`pairwise` 发出源 Observable 的
 * 第二个和随后的发送，而不发送第一个，因为它没有前一个值。
 * 
 *
 * @example <caption>每次点击(从第二次开始)，都会发出与前一次点击的相对距离</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var pairs = clicks.pairwise();
 * var distance = pairs.map(pair => {
 *   var x0 = pair[0].clientX;
 *   var y0 = pair[0].clientY;
 *   var x1 = pair[1].clientX;
 *   var y1 = pair[1].clientY;
 *   return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
 * });
 * distance.subscribe(x => console.log(x));
 *
 * @see {@link buffer}
 * @see {@link bufferCount}
 *
 * @return {Observable<Array<T>>} 该 Observabale 为源 Observable 的
 * 成对的连续值(数组)。
 * @method pairwise
 * @owner Observable
 */
export function pairwise<T>(this: Observable<T>): Observable<[T, T]> {
  return this.lift(new PairwiseOperator());
}

class PairwiseOperator<T> implements Operator<T, [T, T]> {
  call(subscriber: Subscriber<[T, T]>, source: any): any {
    return source.subscribe(new PairwiseSubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class PairwiseSubscriber<T> extends Subscriber<T> {
  private prev: T;
  private hasPrev: boolean = false;

  constructor(destination: Subscriber<[T, T]>) {
    super(destination);
  }

  _next(value: T): void {
    if (this.hasPrev) {
      this.destination.next([this.prev, value]);
    } else {
      this.hasPrev = true;
    }

    this.prev = value;
  }
}
