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

Observable.of(1,2,3).map(function (x) { return x + '!!!'; }); // 等等
```

导入操作符并**手动地**使用它们(这对于减少 bundling 的体积也十分有用)：

```js
var of = require('rxjs/observable/of').of;
var map = require('rxjs/operator/map').map;

map.call(of(1,2,3), function (x) { return x + '!!!'; });
```

还可以使用上面的方法来构建你自己的 Observable 并将其从你自己的模块中导出。

### 使用 TypeScript 的 CommonJS 模式

当使用 RxJS 时收到了像  `error TS2304: Cannot find name 'Promise'` 或 `error TS2304: Cannot find name 'Iterable'` 这样的报错信息，那么你可能需要安装额外的 typings 。

1. 对于使用 [`typings`](https://github.com/typings/typings) 的用户:

    `typings install es6-shim --ambient`

2. 如果没有使用 typings 的话，可以从 [/es6-shim/es6-shim.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/es6-shim/es6-shim.d.ts) 拷贝定义好的接口。

3. 在 `tsconfig.json` 或 CLI 参数中添加类型定义文件。

## 通过 npm 所有全模块类型 (CJS/ES6/AMD/TypeScript)

要安装这个库需要 [npm](https://www.npmjs.org) **3**及以上版本，使用下面的命令行：

```none
npm install @reactivex/rxjs
```

如果你使用的还是 npm **2**的话，那么在这个库升级至稳定版之前，需要明确地指定库的版本号：

```none
npm install @reactivex/rxjs@5.0.0-beta.1
```

## CDN

对于 CDN，可以使用 [unpkg](https://unpkg.com) 。只需要用当前的版本号来替换下面链接中的 `version`：

对于 RxJS 5.0.0-beta.1 到 beta.11：
https://unpkg.com/@reactivex/rxjs@version/dist/global/Rx.umd.js

对于 RxJS 5.0.0-beta.12 及以上版本：
https://unpkg.com/@reactivex/rxjs@version/dist/global/Rx.js
