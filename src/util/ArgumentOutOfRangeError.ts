/**
 * 当在 Observable 的特定下标查询元素时，没有该下标或者位置存在于该序列时，抛出该
 * 错误。
 * 
 * @see {@link elementAt}
 * @see {@link take}
 * @see {@link takeLast}
 *
 * @class ArgumentOutOfRangeError
 */
export class ArgumentOutOfRangeError extends Error {
  constructor() {
    const err: any = super('argument out of range');
    (<any> this).name = err.name = 'ArgumentOutOfRangeError';
    (<any> this).stack = err.stack;
    (<any> this).message = err.message;
  }
}
