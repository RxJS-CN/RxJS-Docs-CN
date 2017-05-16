## 通过 npm 安装 ES6 版本

```none
npm install rxjs
```

导入整个核心功能集：

```js
import Rx from 'rxjs/Rx';

Rx.Observable.of(1,2,3)
```

通过打补丁的方式只导入所需要的(这对于减少 bundling 的体积是十分有用的)：

```js 
import { Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

Observable.of(1,2,3).map(x => x + '!!!'); // 等等
```

只导入需要的并且使用被提议的[绑定操作符](https://github.com/tc39/proposal-bind-operator)：

> 注意：这个额外的预发需要[编译器支持](http://babeljs.io/docs/plugins/transform-function-bind/)并且此语法可能会在没有任何通知的情况下完全从 TC39 撤回！要使用的话需要你自己来承担风险。

```js
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operator/map';

Observable::of(1,2,3)::map(x => x + '!!!'); // 等等
```

## 通过 npm 安装 CommonJS 版本

```none
npm install rxjs
```

导入所有核心功能:

```js
var Rx = require('rxjs/Rx');

Rx.Observable.of(1,2,3); // 等等
```

通过打补丁的方式只导入所需要的(这对于减少 bundling 的体积是十分有用的)：

```js
var Observable = require('rxjs/Observable').Observable;
// 使用适合的方法在 Observable 上打补丁
require('rxjs/add/observable/of');
require('rxjs/add/operator/map');

Observable.of(1,2,3).map(function (x) { return x + '!!!'; }); // etc
```

Import operators and use them _manually_ you can do the following (this is also useful for bundling):

```js
var of = require('rxjs/observable/of').of;
var map = require('rxjs/operator/map').map;

map.call(of(1,2,3), function (x) { return x + '!!!'; });
```

You can also use the above method to build your own Observable and export it from your own module.

### CommonJS with TypeScript
If you recieve an error like `error TS2304: Cannot find name 'Promise'` or `error TS2304: Cannot find name 'Iterable'` when using RxJS you may need to install a supplemental set of typings.

1. For [`typings`](https://github.com/typings/typings) users:

    `typings install es6-shim --ambient`

2. If you're not using typings the interfaces can be copied from [/es6-shim/es6-shim.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/es6-shim/es6-shim.d.ts).

3. Add type definition file included in `tsconfig.json` or CLI argument.

## All Module Types (CJS/ES6/AMD/TypeScript) via npm

To install this library via [npm](https://www.npmjs.org) **version 3**, use the following command:

```none
npm install @reactivex/rxjs
```

If you are using npm **version 2** before this library has achieved a stable version, you need to specify the library version explicitly:

```none
npm install @reactivex/rxjs@5.0.0-beta.1
```

## CDN

For CDN, you can use [unpkg](https://unpkg.com). Just replace `version` with the current
version on the link below:

For RxJS 5.0.0-beta.1 through beta.11:
https://unpkg.com/@reactivex/rxjs@version/dist/global/Rx.umd.js

For RxJS 5.0.0-beta.12 and higher:
https://unpkg.com/@reactivex/rxjs@version/dist/global/Rx.js
