/**
 * 当查询 Observable 或者序列没有元素时，则抛出该错误。
 *
 * @see {@link first}
 * @see {@link last}
 * @see {@link single}
 *
 * @class EmptyError
 */
export class EmptyError extends Error {
  constructor() {
    const err: any = super('no elements in sequence');
    (<any> this).name = err.name = 'EmptyError';
    (<any> this).stack = err.stack;
    (<any> this).message = err.message;
  }
}
