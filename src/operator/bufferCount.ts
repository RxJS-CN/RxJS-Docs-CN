import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';

/**
 * 缓冲源Observable的值直到缓冲数量到达设定的`bufferSize`.
 *
 * <span class="informal">收集成数组, 当数组数量到达设定的`bufferSize`
 * 发出数组.</span>
 *
 * <img src="./img/bufferCount.png" width="100%">
 *
 * 缓冲一组来自源Observable并且长度为设定的的`bufferSize`的数据，缓冲满了就发出, 
 * 在每次缓冲数量到达`startBufferEvery`的时候开启新的缓冲.如果`startBufferEvery`
 * 没有提供或者为`null`, 新的缓冲会在源开始的时候开启并且在每次发出的时候关闭.
 *
 * @example <caption>发出两次点击</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var buffered = clicks.bufferCount(2);
 * buffered.subscribe(x => console.log(x));
 *
 * @example <caption>在每次点击的时候, 以数组的形势发出最近两次的点击</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var buffered = clicks.bufferCount(2, 1);
 * buffered.subscribe(x => console.log(x));
 *
 * @see {@link buffer}
 * @see {@link bufferTime}
 * @see {@link bufferToggle}
 * @see {@link bufferWhen}
 * @see {@link pairwise}
 * @see {@link windowCount}
 *
 * @param {number} bufferSize 缓存区的最大长度.
 * @param {number} [startBufferEvery] 确定合适启用新的缓冲区.
 * 比如说：如果`startBufferEvery`是`2`, 那么隔一个数据会开一个新
 * 的缓冲区. 默认会开启一个缓冲区.
 * @return {Observable<T[]>} 发送缓冲数据的Observable.
 * @method bufferCount
 * @owner Observable
 */
export function bufferCount<T>(this: Observable<T>, bufferSize: number, startBufferEvery: number = null): Observable<T[]> {
  return this.lift(new BufferCountOperator<T>(bufferSize, startBufferEvery));
}

class BufferCountOperator<T> implements Operator<T, T[]> {
  private subscriberClass: any;

  constructor(private bufferSize: number, private startBufferEvery: number) {
    if (!startBufferEvery || bufferSize === startBufferEvery) {
      this.subscriberClass = BufferCountSubscriber;
    } else {
      this.subscriberClass = BufferSkipCountSubscriber;
    }
  }

  call(subscriber: Subscriber<T[]>, source: any): TeardownLogic {
    return source.subscribe(new this.subscriberClass(subscriber, this.bufferSize, this.startBufferEvery));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class BufferCountSubscriber<T> extends Subscriber<T> {
  private buffer: T[] = [];

  constructor(destination: Subscriber<T[]>, private bufferSize: number) {
    super(destination);
  }

  protected _next(value: T): void {
    const buffer = this.buffer;

    buffer.push(value);

    if (buffer.length == this.bufferSize) {
      this.destination.next(buffer);
      this.buffer = [];
    }
  }

  protected _complete(): void {
    const buffer = this.buffer;
    if (buffer.length > 0) {
      this.destination.next(buffer);
    }
    super._complete();
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class BufferSkipCountSubscriber<T> extends Subscriber<T> {
  private buffers: Array<T[]> = [];
  private count: number = 0;

  constructor(destination: Subscriber<T[]>, private bufferSize: number, private startBufferEvery: number) {
    super(destination);
  }

  protected _next(value: T): void {
    const { bufferSize, startBufferEvery, buffers, count } = this;

    this.count++;
    if (count % startBufferEvery === 0) {
      buffers.push([]);
    }

    for (let i = buffers.length; i--; ) {
      const buffer = buffers[i];
      buffer.push(value);
      if (buffer.length === bufferSize) {
        buffers.splice(i, 1);
        this.destination.next(buffer);
      }
    }
  }

  protected _complete(): void {
    const { buffers, destination } = this;

    while (buffers.length > 0) {
      let buffer = buffers.shift();
      if (buffer.length > 0) {
        destination.next(buffer);
      }
    }
    super._complete();
  }

}
