import { Observable } from '../Observable';
import { map } from './map';

/**
 * 将每个源值(对象)映射成它指定的嵌套属性。
 *
 * <span class="informal">类似于 {@link map}，但仅用于选择每个发出对象的某个嵌套属性。</span>
 *
 * <img src="./img/pluck.png" width="100%">
 *
 * 给定描述对象属性路径的字符串的列表，然后从源 Observable 中的所有值中检索指定嵌套
 * 属性的值。如果属性无法解析，它会返回 `undefined` 。
 *
 * @example <caption>将每次点击映射成点击的 target 元素的 tagName 属性</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var tagNames = clicks.pluck('target', 'tagName');
 * tagNames.subscribe(x => console.log(x));
 *
 * @see {@link map}
 *
 * @param {...string} properties 从每个源值(对象啊)中提取的嵌套属性。
 * @return {Observable} 全新的 Observable，它发出源自源值的属性值。
 * @method pluck
 * @owner Observable
 */
export function pluck<T, R>(this: Observable<T>, ...properties: string[]): Observable<R> {
  const length = properties.length;
  if (length === 0) {
    throw new Error('list of properties cannot be empty.');
  }
  return map.call(this, plucker(properties, length));
}

function plucker(props: string[], length: number): (x: string) => any {
  const mapper = (x: string) => {
    let currentProp = x;
    for (let i = 0; i < length; i++) {
      const p = currentProp[props[i]];
      if (typeof p !== 'undefined') {
        currentProp = p;
      } else {
        return undefined;
      }
    }
    return currentProp;
  };

  return mapper;
}
