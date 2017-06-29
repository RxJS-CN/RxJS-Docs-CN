/**
 * 在 {@link Subscription} 的 `unsubscribe` 期间，发送一个或者多个错误，则抛出该错误。
 */
export class UnsubscriptionError extends Error {
  constructor(public errors: any[]) {
    super();
    const err: any = Error.call(this, errors ?
      `${errors.length} errors occurred during unsubscription:
  ${errors.map((err, i) => `${i + 1}) ${err.toString()}`).join('\n  ')}` : '');
    (<any> this).name = err.name = 'UnsubscriptionError';
    (<any> this).stack = err.stack;
    (<any> this).message = err.message;
  }
}
