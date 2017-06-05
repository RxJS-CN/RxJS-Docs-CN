import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { Subscription } from '../Subscription';

import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';

import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

/**
 * 分支源 Observable 的值作为嵌套 Observable，当 `openings` 的时候开始，当输出 `closingSelector` 发送的时候结束。
 *
 * <span class="informal">就像是 {@link bufferToggle}, 但是发出嵌套 Observable 而不是数组。</span>
 *
 * <img src="./img/windowToggle.png" width="100%">
 *
 * 返回一个发出从源 Observable 收集到数据的 window Observable。输出 Observable 发出 windows ，每一个 window
 * 包括当 `openings` 发出时开始收集源 Observable 的数据项和 `closingSelector` 返回的 Observable 发出时结束收集
 * 的数据项。
 *
 * @example <caption>每一秒, 发出接下来 500ms 的点击事件。</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var openings = Rx.Observable.interval(1000);
 * var result = clicks.windowToggle(openings, i =>
 *   i % 2 ? Rx.Observable.interval(500) : Rx.Observable.empty()
 * ).mergeAll();
 * result.subscribe(x => console.log(x));
 *
 * @see {@link window}
 * @see {@link windowCount}
 * @see {@link windowTime}
 * @see {@link windowWhen}
 * @see {@link bufferToggle}
 *
 * @param {Observable<O>} openings 通知开启新 windows 的 observable。
 * @param {function(value: O): Observable} closingSelector 是一个接受`openings` observable
 * 发出的值为参数并且返回 Observable 的函数, 当该 observable 发出 `next` 或者 `complete`时，与其相
 * 关联的 window 应该完成。
 * @return {Observable<Observable<T>>} 返回 windows 的 observable, 它反过来又是 Observables。
 * @method windowToggle
 * @owner Observable
 */
export function windowToggle<T, O>(this: Observable<T>, openings: Observable<O>,
                                   closingSelector: (openValue: O) => Observable<any>): Observable<Observable<T>> {
  return this.lift(new WindowToggleOperator<T, O>(openings, closingSelector));
}

class WindowToggleOperator<T, O> implements Operator<T, Observable<T>> {

  constructor(private openings: Observable<O>,
              private closingSelector: (openValue: O) => Observable<any>) {
  }

  call(subscriber: Subscriber<Observable<T>>, source: any): any {
    return source.subscribe(new WindowToggleSubscriber(
      subscriber, this.openings, this.closingSelector
    ));
  }
}

interface WindowContext<T> {
  window: Subject<T>;
  subscription: Subscription;
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class WindowToggleSubscriber<T, O> extends OuterSubscriber<T, any> {
  private contexts: WindowContext<T>[] = [];
  private openSubscription: Subscription;

  constructor(destination: Subscriber<Observable<T>>,
              private openings: Observable<O>,
              private closingSelector: (openValue: O) => Observable<any>) {
    super(destination);
    this.add(this.openSubscription = subscribeToResult(this, openings, openings));
  }

  protected _next(value: T) {
    const { contexts } = this;
    if (contexts) {
      const len = contexts.length;
      for (let i = 0; i < len; i++) {
        contexts[i].window.next(value);
      }
    }
  }

  protected _error(err: any) {

    const { contexts } = this;
    this.contexts = null;

    if (contexts) {
      const len = contexts.length;
      let index = -1;

      while (++index < len) {
        const context = contexts[index];
        context.window.error(err);
        context.subscription.unsubscribe();
      }
    }

    super._error(err);
  }

  protected _complete() {
    const { contexts } = this;
    this.contexts = null;
    if (contexts) {
      const len = contexts.length;
      let index = -1;
      while (++index < len) {
        const context = contexts[index];
        context.window.complete();
        context.subscription.unsubscribe();
      }
    }
    super._complete();
  }

  protected _unsubscribe() {
    const { contexts } = this;
    this.contexts = null;
    if (contexts) {
      const len = contexts.length;
      let index = -1;
      while (++index < len) {
        const context = contexts[index];
        context.window.unsubscribe();
        context.subscription.unsubscribe();
      }
    }
  }

  notifyNext(outerValue: any, innerValue: any,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, any>): void {

    if (outerValue === this.openings) {

      const { closingSelector } = this;
      const closingNotifier = tryCatch(closingSelector)(innerValue);

      if (closingNotifier === errorObject) {
        return this.error(errorObject.e);
      } else {
        const window = new Subject<T>();
        const subscription = new Subscription();
        const context = { window, subscription };
        this.contexts.push(context);
        const innerSubscription = subscribeToResult(this, closingNotifier, context);

        if (innerSubscription.closed) {
          this.closeWindow(this.contexts.length - 1);
        } else {
          (<any> innerSubscription).context = context;
          subscription.add(innerSubscription);
        }

        this.destination.next(window);

      }
    } else {
      this.closeWindow(this.contexts.indexOf(outerValue));
    }
  }

  notifyError(err: any): void {
    this.error(err);
  }

  notifyComplete(inner: Subscription): void {
    if (inner !== this.openSubscription) {
      this.closeWindow(this.contexts.indexOf((<any> inner).context));
    }
  }

  private closeWindow(index: number): void {
    if (index === -1) {
      return;
    }

    const { contexts } = this;
    const context = contexts[index];
    const { window, subscription } = context;
    contexts.splice(index, 1);
    window.complete();
    subscription.unsubscribe();
  }
}
