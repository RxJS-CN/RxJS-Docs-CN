import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { IScheduler } from '../Scheduler';
import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { AsyncSubject } from '../AsyncSubject';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class BoundCallbackObservable<T> extends Observable<T> {
  subject: AsyncSubject<T>;

  /* tslint:disable:max-line-length */
  static create(callbackFunc: (callback: () => any) => any, selector?: void, scheduler?: IScheduler): () => Observable<void>;
  static create<R>(callbackFunc: (callback: (result: R) => any) => any, selector?: void, scheduler?: IScheduler): () => Observable<R>;
  static create<T, R>(callbackFunc: (v1: T, callback: (result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T) => Observable<R>;
  static create<T, T2, R>(callbackFunc: (v1: T, v2: T2, callback: (result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T, v2: T2) => Observable<R>;
  static create<T, T2, T3, R>(callbackFunc: (v1: T, v2: T2, v3: T3, callback: (result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3) => Observable<R>;
  static create<T, T2, T3, T4, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, callback: (result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4) => Observable<R>;
  static create<T, T2, T3, T4, T5, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, callback: (result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => Observable<R>;
  static create<T, T2, T3, T4, T5, T6, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, callback: (result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => Observable<R>;
  static create<R>(callbackFunc: (callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: IScheduler): () => Observable<R>;
  static create<T, R>(callbackFunc: (v1: T, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: IScheduler): (v1: T) => Observable<R>;
  static create<T, T2, R>(callbackFunc: (v1: T, v2: T2, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: IScheduler): (v1: T, v2: T2) => Observable<R>;
  static create<T, T2, T3, R>(callbackFunc: (v1: T, v2: T2, v3: T3, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3) => Observable<R>;
  static create<T, T2, T3, T4, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4) => Observable<R>;
  static create<T, T2, T3, T4, T5, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => Observable<R>;
  static create<T, T2, T3, T4, T5, T6, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, callback: (...args: any[]) => any) => any, selector: (...args: any[]) => R, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => Observable<R>;
  static create<T>(callbackFunc: Function, selector?: void, scheduler?: IScheduler): (...args: any[]) => Observable<T>;
  static create<T>(callbackFunc: Function, selector?: (...args: any[]) => T, scheduler?: IScheduler): (...args: any[]) => Observable<T>;
  /* tslint:enable:max-line-length */

  /**
   * 把回调API转化为返回Observable的函数
   * <span class="informal">给它一个签名为`f(x, callback)`的函数f,返回一个函数g,
   * 调用'g(x)'的时候会返回一个Observable</span>
   * 
   * `bindCallback` 并不是一个操作符，因为它的输入和输出并不是Observable。输入的是一个
   * 带有多个参数的函数，并且该函数的最后一个参数必须是个回调函数，当该函数执行完之后会掉
   * 用回调函数。
   *
   * `bindCallback` 的输出是一个函数，该函数接受的参数和输入函数一样(除了没有最后一个回调函
   * 数)。当输出函数被掉用，会返回一个Observable。如果输入函数给回调函数传递一个值，则该Observable
   * 会发射这个值。如果输入函数给回调函数传递多个值，则该Observable会发射一个包含所有值的数组。
   * 
   * 很重要的一点是，输入函数在输出函数返回的Observable被订阅之前不会执行。这意味着如果输入
   * 函数是AJAX请求，该请求在返回的Observable每次被订阅之后才会发出。
   *
   * 作为一个可选项，选择器函数可以传给`bindObservable`.该函数接受和回调一样的参数。返回Observable
   * 发射的值，而不是回调参数本身，即使默认情况下，传递给回调的多个参数将在流中显示为数组。选择器
   * 函数直接用参数掉用，就像回调一样。这意味着你可以想象默认选择器（当没有显示提供的时候）是这样
   * 一个函数:将它的所有参数聚集到数组中，或者仅仅返回第一个参数当只有一个参数的时候。
   *
   * 最后一个可选参数 - {@link Scheduler} - 可以用来控制当Observable被订阅的时候掉用输入函
   * 数以及发射结果的时机。默认订阅Observable后掉用输入函数是同步的，但是使用`Scheduler.async`
   * 作为最后一个参数将会延迟输入函数的掉用，就像是用0毫秒的setTimeout包装过。所以如果你使用了异
   * 步调度器并且订阅了Observable，当前正在执行的所有函数调用，将在调用“输入函数”之前结束。
   *
   * 当涉及到传递给回调的结果时，默认情况下当输入函数调用回调之后会立马发射，特别的，如果回调是同步
   * 调用的，那么Observable的订阅也会同步掉用`next`方法。如果你想延迟掉用，使用`Scheduler.async`。
   * 这意味着通过使用`Scheduler.async`，你可以确保输入函数永远异步掉用回调函数，从而避免了可怕的Zalgo。
   *
   * 需要注意的是，输出函数返回的Observable只能发射一次然后完成。即使输入函数多次掉用回调函数，第二次
   * 以及之后的掉用都不会出现在流中。如果你需要监听多次的掉用，你大概需要使用{@link fromEvent}或者
   * {@link fromEventPattern}来代替。
   *
   * 如果输入函数依赖上下文(this),该上下文将被设置为输出函数在调用时的同一上下文.特别的，如果输入函数
   * 被当作是某个对象的方法进行掉用，为了保持同样的行为，建议将输出函数的上下文设置为该对象，输入方法不
   * 是已经绑定的。
   *
   * 如果输入函数以node的方式(第一个参数是可选的错误参数用来标示掉用是否成功)掉用回调函数，{@link bindNodeCallback}
   * 提供了方便的错误处理，也许是更好的选择。 `bindCallback` 不会区别对待这些方法，错误参数(是否传递)
   * 被解释成正常的参数。
   *
   * @example <caption>把jQuery的getJSON方法转化为Observable API</caption>
   * // 假设我们有这个方法:jQuery.getJSON('/my/url', callback)
   * var getJSONAsObservable = Rx.Observable.bindCallback(jQuery.getJSON);
   * var result = getJSONAsObservable('/my/url');
   * result.subscribe(x => console.log(x), e => console.error(e));
   *
   *
   * @example <caption>接收传递给回调的参数数组</caption>
   * someFunction((a, b, c) => {
   *   console.log(a); // 5
   *   console.log(b); // 'some string'
   *   console.log(c); // {someProperty: 'someValue'}
   * });
   *
   * const boundSomeFunction = Rx.Observable.bindCallback(someFunction);
   * boundSomeFunction().subscribe(values => {
   *   console.log(values) // [5, 'some string', {someProperty: 'someValue'}]
   * });
   *
   *
   * @example <caption>使用bindCallback选择器函数</caption>
   * someFunction((a, b, c) => {
   *   console.log(a); // 'a'
   *   console.log(b); // 'b'
   *   console.log(c); // 'c'
   * });
   *
   * const boundSomeFunction = Rx.Observable.bindCallback(someFunction, (a, b, c) => a + b + c);
   * boundSomeFunction().subscribe(value => {
   *   console.log(value) // 'abc'
   * });
   *
   *
   * @example <caption>比较异步和非异步调度的行为</caption>
   * function iCallMyCallbackSynchronously(cb) {
   *   cb();
   * }
   *
   * const boundSyncFn = Rx.Observable.bindCallback(iCallMyCallbackSynchronously);
   * const boundAsyncFn = Rx.Observable.bindCallback(iCallMyCallbackSynchronously, null, Rx.Scheduler.async);
   *
   * boundSyncFn().subscribe(() => console.log('I was sync!'));
   * boundAsyncFn().subscribe(() => console.log('I was async!'));
   * console.log('This happened...');
   *
   * // Logs:
   * // I was sync!
   * // This happened...
   * // I was async!
   *
   *
   * @example <caption>bindCallback对象方法</caption>
   * const boundMethod = Rx.Observable.bindCallback(someObject.methodWithCallback);
   * boundMethod.call(someObject) // 确保methodWithCallback可以访问someObject
   * .subscribe(subscriber);
   *
   *
   * @see {@link bindNodeCallback}
   * @see {@link from}
   * @see {@link fromPromise}
   *
   * @param {function} func 最后一个参数是回调的函数.
   * @param {function} [selector] 选择器，从回调函数中获取参数并将这些映射为一个Observable发射的值
   * @param {Scheduler} [scheduler] 调度器，调度回调函数
   * @return {function(...params: *): Observable} 一个返回Observable的函数，该Observable发射回调函数返回的数据。
   * @static true
   * @name bindCallback
   * @owner Observable
   */
  static create<T>(func: Function,
                   selector: Function | void = undefined,
                   scheduler?: IScheduler): (...args: any[]) => Observable<T> {
    return function(this: any, ...args: any[]): Observable<T> {
      return new BoundCallbackObservable<T>(func, <any>selector, args, this, scheduler);
    };
  }

  constructor(private callbackFunc: Function,
              private selector: Function,
              private args: any[],
              private context: any,
              private scheduler: IScheduler) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T | T[]>): Subscription {
    const callbackFunc = this.callbackFunc;
    const args = this.args;
    const scheduler = this.scheduler;
    let subject = this.subject;

    if (!scheduler) {
      if (!subject) {
        subject = this.subject = new AsyncSubject<T>();
        const handler = function handlerFn(this: any, ...innerArgs: any[]) {
          const source = (<any>handlerFn).source;
          const { selector, subject } = source;
          if (selector) {
            const result = tryCatch(selector).apply(this, innerArgs);
            if (result === errorObject) {
              subject.error(errorObject.e);
          } else {
              subject.next(result);
              subject.complete();
            }
          } else {
            subject.next(innerArgs.length <= 1 ? innerArgs[0] : innerArgs);
            subject.complete();
          }
        };
        // use named function instance to avoid closure.
        (<any>handler).source = this;

        const result = tryCatch(callbackFunc).apply(this.context, args.concat(handler));
        if (result === errorObject) {
          subject.error(errorObject.e);
        }
      }
      return subject.subscribe(subscriber);
    } else {
      return scheduler.schedule(BoundCallbackObservable.dispatch, 0, { source: this, subscriber, context: this.context });
    }
  }

  static dispatch<T>(state: { source: BoundCallbackObservable<T>, subscriber: Subscriber<T>, context: any }) {
    const self = (<Subscription><any>this);
    const { source, subscriber, context } = state;
    const { callbackFunc, args, scheduler } = source;
    let subject = source.subject;

    if (!subject) {
      subject = source.subject = new AsyncSubject<T>();

      const handler = function handlerFn(this: any, ...innerArgs: any[]) {
        const source = (<any>handlerFn).source;
        const { selector, subject } = source;
        if (selector) {
          const result = tryCatch(selector).apply(this, innerArgs);
          if (result === errorObject) {
            self.add(scheduler.schedule(dispatchError, 0, { err: errorObject.e, subject }));
          } else {
            self.add(scheduler.schedule(dispatchNext, 0, { value: result, subject }));
          }
        } else {
          const value = innerArgs.length <= 1 ? innerArgs[0] : innerArgs;
          self.add(scheduler.schedule(dispatchNext, 0, { value, subject }));
        }
      };
      // use named function to pass values in without closure
      (<any>handler).source = source;

      const result = tryCatch(callbackFunc).apply(context, args.concat(handler));
      if (result === errorObject) {
        subject.error(errorObject.e);
      }
    }

    self.add(subject.subscribe(subscriber));
  }
}

interface DispatchNextArg<T> {
  subject: AsyncSubject<T>;
  value: T;
}
function dispatchNext<T>(arg: DispatchNextArg<T>) {
  const { value, subject } = arg;
  subject.next(value);
  subject.complete();
}

interface DispatchErrorArg<T> {
  subject: AsyncSubject<T>;
  err: any;
}
function dispatchError<T>(arg: DispatchErrorArg<T>) {
  const { err, subject } = arg;
  subject.error(err);
}
