import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observer } from '../Observer';
import { EmptyError } from '../util/EmptyError';
import { TeardownLogic } from '../Subscription';

/**
 * 该 Observable 发出源 Observable 所发出的值中匹配指定 predicate 函数的单个项。 
 * 如果源 Observable 发出多于1个数据项或者没有发出数据项, 分别以 IllegalArgumentException 和 NoSuchElementException 进行通知。
 *
 * <img src="./img/single.png" width="100%">
 *
 * @throws {EmptyError} 如果 Observable 在发送任何 `next` 通知之前完成的话，则发送 EmptyError 给观察者的 `error` 回调函数。
 * @param {Function} predicate - 断言函数，用来评估源 Observable 的数据项。
 * @return {Observable<T>} 该 Observable 发出源 Observable 所发出的值中匹配指定 predicate 函数的单个项。
 .
 * @method single
 * @owner Observable
 */
export function single<T>(this: Observable<T>, predicate?: (value: T, index: number, source: Observable<T>) => boolean): Observable<T> {
  return this.lift(new SingleOperator(predicate, this));
}

class SingleOperator<T> implements Operator<T, T> {
  constructor(private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private source?: Observable<T>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new SingleSubscriber(subscriber, this.predicate, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SingleSubscriber<T> extends Subscriber<T> {
  private seenValue: boolean = false;
  private singleValue: T;
  private index: number = 0;

  constructor(destination: Observer<T>,
              private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private source?: Observable<T>) {
    super(destination);
  }

  private applySingleValue(value: T): void {
    if (this.seenValue) {
      this.destination.error('Sequence contains more than one element');
    } else {
      this.seenValue = true;
      this.singleValue = value;
    }
  }

  protected _next(value: T): void {
    const index = this.index++;

    if (this.predicate) {
      this.tryNext(value, index);
    } else {
      this.applySingleValue(value);
    }
  }

  private tryNext(value: T, index: number): void {
    try {
      if (this.predicate(value, index, this.source)) {
        this.applySingleValue(value);
      }
    } catch (err) {
      this.destination.error(err);
    }
  }

  protected _complete(): void {
    const destination = this.destination;

    if (this.index > 0) {
      destination.next(this.seenValue ? this.singleValue : undefined);
      destination.complete();
    } else {
      destination.error(new EmptyError);
    }
  }
}
