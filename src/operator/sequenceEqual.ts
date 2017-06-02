import { Operator } from '../Operator';
import { Observer } from '../Observer';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';

/**
 * 顺序的比较两个 observables 的所有值通过可选的比较函数然后只有代表两个序列是否相等的单个 boolean 值的 observable。
 *
 * <span class="informal">顺序的比较所有 observables 发出的所有值是否相等。</span>
 *
 * <img src="./img/sequenceEqual.png" width="100%">
 *
 * `sequenceEqual` 订阅两个 observables 并且缓冲每个 observable 发出的值。 当任何一个 observable 发出数据， 该值会被缓冲
 * 并且缓冲区从底部向上移动和比较； 如果任何一对值不匹配， 返回的 observable 会发出 `false` 和完成。 如果其中一个observables完
 * 成了， 操作符会等待另一个observable完成； 如果另一个observable在完成之前又发出了数据， 返回 observable 会发出 `false` 和完
 * 成。 如果其中一个 observable 永远不会完成或者在另一个完成后还发出数据， 返回的 observable 永远不会结束。
 *
 * @example <caption>指出 Konami 码是否匹配</caption>
 * var code = Rx.Observable.from([
 *  "ArrowUp",
 *  "ArrowUp",
 *  "ArrowDown",
 *  "ArrowDown",
 *  "ArrowLeft",
 *  "ArrowRight",
 *  "ArrowLeft",
 *  "ArrowRight",
 *  "KeyB",
 *  "KeyA",
 *  "Enter" // no start key, clearly.
 * ]);
 *
 * var keys = Rx.Observable.fromEvent(document, 'keyup')
 *  .map(e => e.code);
 * var matches = keys.bufferCount(11, 1)
 *  .mergeMap(
 *    last11 =>
 *      Rx.Observable.from(last11)
 *        .sequenceEqual(code)
 *   );
 * matches.subscribe(matched => console.log('Successful cheat at Contra? ', matched));
 *
 * @see {@link combineLatest}
 * @see {@link zip}
 * @see {@link withLatestFrom}
 *
 * @param {Observable} compareTo 用来和源 observable 比较的 observable 序列。
 * @param {function} [comparor] 用来比较每对的比较函数
 * @return {Observable} 拥有单个表示所有 observables 数列是否相等的 boolean 值的 Observable。
 * @method sequenceEqual
 * @owner Observable
 */
export function sequenceEqual<T>(this: Observable<T>, compareTo: Observable<T>,
                                 comparor?: (a: T, b: T) => boolean): Observable<boolean> {
  return this.lift(new SequenceEqualOperator(compareTo, comparor));
}

export class SequenceEqualOperator<T> implements Operator<T, boolean> {
  constructor(private compareTo: Observable<T>,
              private comparor: (a: T, b: T) => boolean) {
  }

  call(subscriber: Subscriber<boolean>, source: any): any {
    return source.subscribe(new SequenceEqualSubscriber(subscriber, this.compareTo, this.comparor));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class SequenceEqualSubscriber<T, R> extends Subscriber<T> {
  private _a: T[] = [];
  private _b: T[] = [];
  private _oneComplete = false;

  constructor(destination: Observer<R>,
              private compareTo: Observable<T>,
              private comparor: (a: T, b: T) => boolean) {
    super(destination);
    this.add(compareTo.subscribe(new SequenceEqualCompareToSubscriber(destination, this)));
  }

  protected _next(value: T): void {
    if (this._oneComplete && this._b.length === 0) {
      this.emit(false);
    } else {
      this._a.push(value);
      this.checkValues();
    }
  }

  public _complete(): void {
    if (this._oneComplete) {
      this.emit(this._a.length === 0 && this._b.length === 0);
    } else {
      this._oneComplete = true;
    }
  }

  checkValues() {
    const { _a, _b, comparor } = this;
    while (_a.length > 0 && _b.length > 0) {
      let a = _a.shift();
      let b = _b.shift();
      let areEqual = false;
      if (comparor) {
        areEqual = tryCatch(comparor)(a, b);
        if (areEqual === errorObject) {
          this.destination.error(errorObject.e);
        }
      } else {
        areEqual = a === b;
      }
      if (!areEqual) {
        this.emit(false);
      }
    }
  }

  emit(value: boolean) {
    const { destination } = this;
    destination.next(value);
    destination.complete();
  }

  nextB(value: T) {
    if (this._oneComplete && this._a.length === 0) {
      this.emit(false);
    } else {
      this._b.push(value);
      this.checkValues();
    }
  }
}

class SequenceEqualCompareToSubscriber<T, R> extends Subscriber<T> {
  constructor(destination: Observer<R>, private parent: SequenceEqualSubscriber<T, R>) {
    super(destination);
  }

  protected _next(value: T): void {
    this.parent.nextB(value);
  }

  protected _error(err: any): void {
    this.parent.error(err);
  }

  protected _complete(): void {
    this.parent._complete();
  }
}
