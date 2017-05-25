import { isFunction } from '../util/isFunction';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { Subscriber } from '../Subscriber';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class FromEventPatternObservable<T> extends Observable<T> {

  /**
   * 从一个基于addHandler/removeHandler方法的API创建Observable.
   *
   * <span class="informal">将任何addHandler/removeHandler的API转化为Observable.</span>
   *
   * <img src="./img/fromEventPattern.png" width="100%">
   * 
   * 创建Observable，该Observable通过使用`addHandler` 和 `removeHandler`添加和删除事件处理器, 
   * 使用可选的选择器函数将事件参数转化为结果. `addHandler`当输出Observable被订阅的时候调用, `removeHandler`
   * 方法在取消订阅的时候被调用.
   *
   * @example <caption>当document发生点击事件的时候发出</caption>
   * function addClickHandler(handler) {
   *   document.addEventListener('click', handler);
   * }
   *
   * function removeClickHandler(handler) {
   *   document.removeEventListener('click', handler);
   * }
   *
   * var clicks = Rx.Observable.fromEventPattern(
   *   addClickHandler,
   *   removeClickHandler
   * );
   * clicks.subscribe(x => console.log(x));
   *
   * @see {@link from}
   * @see {@link fromEvent}
   *
   * @param {function(handler: Function): any} addHandler 一个接收处理器的函数，并且将
   * 该处理器添加到事件源.
   * @param {function(handler: Function, signal?: any): void} [removeHandler] 可选的
   * 函数，接受处理器函数做为参数，可以移除处理器当之前使用`addHandler`添加处理器.如果addHandler
   * 返回的信号当移除的时候要清理，removeHandler会去做这件事情.
   * @param {function(...args: any): T} [selector] 可选的函数处理结果. 接受事件处理的参数返
   * 回单个的值.
   * @return {Observable<T>}
   * @static true
   * @name fromEventPattern
   * @owner Observable
   */
  static create<T>(addHandler: (handler: Function) => any,
                   removeHandler?: (handler: Function, signal?: any) => void,
                   selector?: (...args: Array<any>) => T) {
    return new FromEventPatternObservable(addHandler, removeHandler, selector);
  }

  constructor(private addHandler: (handler: Function) => any,
              private removeHandler?: (handler: Function, signal?: any) => void,
              private selector?: (...args: Array<any>) => T) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    const removeHandler = this.removeHandler;

    const handler = !!this.selector ? (...args: Array<any>) => {
      this._callSelector(subscriber, args);
    } : function(e: any) { subscriber.next(e); };

    const retValue = this._callAddHandler(handler, subscriber);

    if (!isFunction(removeHandler)) {
      return;
    }

    subscriber.add(new Subscription(() => {
      //TODO: determine whether or not to forward to error handler
      removeHandler(handler, retValue) ;
    }));
  }

  private _callSelector(subscriber: Subscriber<T>, args: Array<any>): void {
    try {
      const result: T = this.selector(...args);
      subscriber.next(result);
    }
    catch (e) {
      subscriber.error(e);
    }
  }

  private _callAddHandler(handler: (e: any) => void, errorSubscriber: Subscriber<T>): any | null {
    try {
      return this.addHandler(handler) || null;
    }
    catch (e) {
      errorSubscriber.error(e);
    }
  }
}