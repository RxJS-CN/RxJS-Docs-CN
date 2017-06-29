/**
 * 当查询 Observable 特定索引的元素时，在 Observable 序列中没有此索引或位置的话，则抛出此错误。
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
