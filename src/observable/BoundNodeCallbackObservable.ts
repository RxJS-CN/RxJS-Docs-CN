import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { IScheduler } from '../Scheduler';
import { Action } from '../scheduler/Action';
import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { AsyncSubject } from '../AsyncSubject';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class BoundNodeCallbackObservable<T> extends Observable<T> {
  subject: AsyncSubject<T>;

  /* tslint:disable:max-line-length */
  static create<R>(callbackFunc: (callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: IScheduler): () => Observable<R>;
  static create<T, R>(callbackFunc: (v1: T, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T) => Observable<R>;
  static create<T, T2, R>(callbackFunc: (v1: T, v2: T2, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T, v2: T2) => Observable<R>;
  static create<T, T2, T3, R>(callbackFunc: (v1: T, v2: T2, v3: T3, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3) => Observable<R>;
  static create<T, T2, T3, T4, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4) => Observable<R>;
  static create<T, T2, T3, T4, T5, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => Observable<R>;
  static create<T, T2, T3, T4, T5, T6, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: IScheduler): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => Observable<R>;
  static create<T>(callbackFunc: Function, selector?: void, scheduler?: IScheduler): (...args: any[]) => Observable<T>;
  static create<T>(callbackFunc: Function, selector?: (...args: any[]) => T, scheduler?: IScheduler): (...args: any[]) => Observable<T>;
  /* tslint:enable:max-line-length */

  /**
   * 把Node.js式回调API转换为返回Observable的函数
   *
   * <span class="informal">就像是 {@link bindCallback}, 但是回调函数必须形如
   * `callback(error, result)`这样</span>
   *
   * `bindCallback` 并不是一个操作符，因为它的输入和输出并不是Observable。输入的是一个
   * 带有多个参数的函数，并且该函数的最后一个参数必须是个回调函数，当该函数执行完之后会掉
   * 用回调函数，回调函数被要求遵循Node.js公约，第一个参数是错误对象，标示掉用是否成功。
   * 如果这个错误对象被传递给了回调函数，这意味着掉用出现了错误。
   *
   * `bindCallback` 的输出是一个函数，该函数接受的参数和输入函数一样(除了没有最后一个回调函
   * 数)。当输出函数被掉用，会返回一个Observable。如果输入函数带着错误对象掉用回调函数，Observable
   * 也会用这个错误对象触发错误状态。如果错误对象没有被传递，Observable会发射第二个参数。
   * 如果输入函数给回调函数传递三个或者更多的值，该Observable会发射一个包含除了第一个错误参
   * 数的所有值的数组。
   *
   * `bindNodeCallback`接受可选的选择器函数，它允许Observable发射由选择器计算的值，而
   * 不是普通的回调参数。这和{@link bindCallback}的选择器效果类似，但是node式的错误参数永远
   * 不会传递给函数。
   *
   * 注意，输入函数永远不会被掉用直到输出函数返回的Observable被订阅。默认情况下，订阅后会同步掉用
   * 输入方法, 但是这可以被改变，通过使用{@link Scheduler}作为可选的第三个参数。
   * 调度器可以控制Observable何时发射数据。想要获取更多信息，请查看{@link bindCallback}的文档，
   * 工作原理完全一样
   *
   * 和{@link bindCallback}一样，输入函数的上下文(this)将会被设置给输出函数的上下文，当它被掉用
   * 的时候。当Observable发射了数据后，它会立马完成。这意味着即使输入函数再次掉用回调函数，第二次以
   * 及后续掉用的值永远不会出现在流中。如果你需要处理多次掉用，查看{@link fromEvent}或者{@link fromEventPattern}
   * 来替代。
   *
   * 注意，`bindNodeCallback`同样可以被用在非Node.js环境中，Node.js式回调函数仅仅是一种公约，所以
   * 如果你的目标环境是浏览器或者其他，并且你使用的API遵守了这种回调公约，`bindNodeCallback`就可以
   * 安全的使用那些API函数。
   *
   * 牢记，传递给回调的错误对象并不是JavaScript内置的Error的实例。事实上，它甚至可以不是对象。
   * 回调函数的错误参数被解读为“出现”，当该参数有值的时候。它可以是，比如说，非0数字，非空字符串，逻辑
   * 是。这些情况下，都会触发Observable的错误状态。这意味着通常形式的回调函数都会触发失败当使用`bindNodeCallback`
   * 的时候。如果你的Observable经常发生你预料之外的错误，请检查下回调函数是否是node.js式的回调，如果
   * 不是，请使用{@link bindCallback}替代。
   *
   * 注意，即使错误参数出现在回调函数中，但是它的值是falsy(译者注：falsy值是指在布尔上下文中可以被转
   * 化为false的值)，它仍然不会出现在Observable的发射数组或者选择器中。
   *
   * @example <caption>从文件系统中读取文件并且从Observable中获取数据</caption>
   * import * as fs from 'fs';
   * var readFileAsObservable = Rx.Observable.bindNodeCallback(fs.readFile);
   * var result = readFileAsObservable('./roadNames.txt', 'utf8');
   * result.subscribe(x => console.log(x), e => console.error(e));
   *
   *
   * @example <caption>使用具有多个参数的函数调用回调</caption>
   * someFunction((err, a, b) => {
   *   console.log(err); // null
   *   console.log(a); // 5
   *   console.log(b); // "some string"
   * });
   * var boundSomeFunction = Rx.Observable.bindNodeCallback(someFunction);
   * boundSomeFunction()
   * .subscribe(value => {
   *   console.log(value); // [5, "some string"]
   * });
   *
   *
   * @example <caption>使用选择器</caption>
   * someFunction((err, a, b) => {
   *   console.log(err); // undefined
   *   console.log(a); // "abc"
   *   console.log(b); // "DEF"
   * });
   * var boundSomeFunction = Rx.Observable.bindNodeCallback(someFunction, (a, b) => a + b);
   * boundSomeFunction()
   * .subscribe(value => {
   *   console.log(value); // "abcDEF"
   * });
   *
   *
   * @example <caption>非node.js式的回调函数</caption>
   * someFunction(a => {
   *   console.log(a); // 5
   * });
   * var boundSomeFunction = Rx.Observable.bindNodeCallback(someFunction);
   * boundSomeFunction()
   * .subscribe(
   *   value => {}             // never gets called
   *   err => console.log(err) // 5
   *);
   *
   *
   * @see {@link bindCallback}
   * @see {@link from}
   * @see {@link fromPromise}
   *
   * @param {function} func 最后一个参数是node.js式回调的函数.
   * @param {function} [selector] 选择器，从回调函数中获取参数并将这些映射为一个Observable发射的值.
   * @param {Scheduler} [scheduler] 调度器，调度回调函数.
   * @return {function(...params: *): 一个返回Observable的函数，该Observable发射node.js式回调函数返回的数据.
   * @static true
   * @name bindNodeCallback
   * @owner Observable
   */
  static create<T>(func: Function,
                   selector: Function | void = undefined,
                   scheduler?: IScheduler): (...args: any[]) => Observable<T> {
    return function(this: any, ...args: any[]): Observable<T> {
      return new BoundNodeCallbackObservable<T>(func, <any>selector, args, this, scheduler);
    };
  }

  constructor(private callbackFunc: Function,
              private selector: Function,
              private args: any[],
              private context: any,
              public scheduler: IScheduler) {
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
          const err = innerArgs.shift();

          if (err) {
            subject.error(err);
          } else if (selector) {
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
      return scheduler.schedule(dispatch, 0, { source: this, subscriber, context: this.context });
    }
  }
}

interface DispatchState<T> {
  source: BoundNodeCallbackObservable<T>;
  subscriber: Subscriber<T>;
  context: any;
}

function dispatch<T>(this: Action<DispatchState<T>>, state: DispatchState<T>) {
  const self = (<Subscription> this);
  const { source, subscriber, context } = state;
  // XXX: cast to `any` to access to the private field in `source`.
  const { callbackFunc, args, scheduler } = source as any;
  let subject = source.subject;

  if (!subject) {
    subject = source.subject = new AsyncSubject<T>();

    const handler = function handlerFn(this: any, ...innerArgs: any[]) {
      const source = (<any>handlerFn).source;
      const { selector, subject } = source;
      const err = innerArgs.shift();

      if (err) {
        self.add(scheduler.schedule(dispatchError, 0, { err, subject }));
      } else if (selector) {
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
      self.add(scheduler.schedule(dispatchError, 0, { err: errorObject.e, subject }));
    }
  }

  self.add(subject.subscribe(subscriber));
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
