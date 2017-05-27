import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';

/**
 * 如果源 Observable 是空的话，它返回一个发出 true 的 Observable，否则发出 false 。
 *
 * <img src="./img/isEmpty.png" width="100%">
 *
 * @return {Observable} 发出布尔值的 Observable 。
 * @method isEmpty
 * @owner Observable
 */
export function isEmpty<T>(this: Observable<T>): Observable<boolean> {
  return this.lift(new IsEmptyOperator());
}

class IsEmptyOperator implements Operator<any, boolean> {
  call (observer: Subscriber<boolean>, source: any): any {
    return source.subscribe(new IsEmptySubscriber(observer));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class IsEmptySubscriber extends Subscriber<any> {
  constructor(destination: Subscriber<boolean>) {
    super(destination);
  }

  private notifyComplete(isEmpty: boolean): void {
    const destination = this.destination;

    destination.next(isEmpty);
    destination.complete();
  }

  protected _next(value: boolean) {
    this.notifyComplete(false);
  }

  protected _complete() {
    this.notifyComplete(true);
  }
}
