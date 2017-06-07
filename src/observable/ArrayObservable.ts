import { IScheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { ScalarObservable } from './ScalarObservable';
import { EmptyObservable } from './EmptyObservable';
import { Subscriber } from '../Subscriber';
import { isScheduler } from '../util/isScheduler';
import { TeardownLogic } from '../Subscription';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class ArrayObservable<T> extends Observable<T> {

  static create<T>(array: T[], scheduler?: IScheduler): Observable<T> {
    return new ArrayObservable(array, scheduler);
  }

  static of<T>(item1: T, scheduler?: IScheduler): Observable<T>;
  static of<T>(item1: T, item2: T, scheduler?: IScheduler): Observable<T>;
  static of<T>(item1: T, item2: T, item3: T, scheduler?: IScheduler): Observable<T>;
  static of<T>(item1: T, item2: T, item3: T, item4: T, scheduler?: IScheduler): Observable<T>;
  static of<T>(item1: T, item2: T, item3: T, item4: T, item5: T, scheduler?: IScheduler): Observable<T>;
  static of<T>(item1: T, item2: T, item3: T, item4: T, item5: T, item6: T, scheduler?: IScheduler): Observable<T>;
  static of<T>(...array: Array<T | IScheduler>): Observable<T>;
  /**
   * 创建一个 Observable，它会依次发出由你提供的参数，最后发出完成通知。
   * <span class="informal">发出你提供的参数，然后完成。
   * </span>
   *
   * <img src="./img/of.png" width="100%">
   *
   * 这个静态操作符适用于创建简单的 Observable ，该 Observable 只发出给定的参数，
   * 在发送完这些参数后发出完成通知。它可以用来和其他 Observables 组合比如说{@link concat}。
   * 默认情况下，它使用`null`调度器，这意味着`next`通知是同步发出的,
   * 尽管使用不同的调度器可以决定这些通知何时送到。
   *
   * @example <caption>发出 10、20、 30, 然后是 'a'、 'b'、 'c', 紧接着开始每秒发出。</caption>
   * var numbers = Rx.Observable.of(10, 20, 30);
   * var letters = Rx.Observable.of('a', 'b', 'c');
   * var interval = Rx.Observable.interval(1000);
   * var result = numbers.concat(letters).concat(interval);
   * result.subscribe(x => console.log(x));
   *
   * @see {@link create}
   * @see {@link empty}
   * @see {@link never}
   * @see {@link throw}
   *
   * @param {...T} values 表示 `next` 发出的值。
   * @param {Scheduler} [scheduler] 用来调度 next 通知发送的调度器( {@link IScheduler} )。
   * @return {Observable<T>} 发出每个给定输入值的 Observable。
   * @static true
   * @name of
   * @owner Observable
   */
  static of<T>(...array: Array<T | IScheduler>): Observable<T> {
    let scheduler = <IScheduler>array[array.length - 1];
    if (isScheduler(scheduler)) {
      array.pop();
    } else {
      scheduler = null;
    }

    const len = array.length;
    if (len > 1) {
      return new ArrayObservable<T>(<any>array, scheduler);
    } else if (len === 1) {
      return new ScalarObservable<T>(<any>array[0], scheduler);
    } else {
      return new EmptyObservable<T>(scheduler);
    }
  }

  static dispatch(state: any) {

    const { array, index, count, subscriber } = state;

    if (index >= count) {
      subscriber.complete();
      return;
    }

    subscriber.next(array[index]);

    if (subscriber.closed) {
      return;
    }

    state.index = index + 1;

    (<any> this).schedule(state);
  }

  // value used if Array has one value and _isScalar
  value: any;

  constructor(private array: T[], private scheduler?: IScheduler) {
    super();
    if (!scheduler && array.length === 1) {
      this._isScalar = true;
      this.value = array[0];
    }
  }

  protected _subscribe(subscriber: Subscriber<T>): TeardownLogic {
    let index = 0;
    const array = this.array;
    const count = array.length;
    const scheduler = this.scheduler;

    if (scheduler) {
      return scheduler.schedule(ArrayObservable.dispatch, 0, {
        array, index, count, subscriber
      });
    } else {
      for (let i = 0; i < count && !subscriber.closed; i++) {
        subscriber.next(array[i]);
      }
      subscriber.complete();
    }
  }
}
