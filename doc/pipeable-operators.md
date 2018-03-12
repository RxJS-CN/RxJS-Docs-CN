# Pipeable 操作符

从5.5版本开始我们提供了 “pipeable 操作符”，它们可以通过 `rxjs/operators` 来访问 (注意 "operators" 是复数)。相比较于通过在 `rxjs/add/operator/*` 中以“打补丁”的方式来获取需要用到的操作符，这是一种更好的方式，

**注意**: 如果使用 `rxjs/operators` 而不修改构建过程的话会导致更大的包。详见下面的[已知问题](#%E5%B7%B2%E7%9F%A5%E9%97%AE%E9%A2%98)一节。

**重命名的操作符**

由于操作符要从 Observable 中独立出来，所以操作符的名称不能和 JavaScript 的关键字冲突。因此一些操作符的 pipeable 版本的名称做出了修改。这些操作符是:

1. `do` -> `tap`
2. `catch` -> `catchError`
3. `switch` -> `switchAll`
4. `finally` -> `finalize`

`pipe` 是 `Observable` 的一部分，不需要导入，并且它可以替代现有的 `let` 操作符。

`source$.let(myOperator) -> source$.pipe(myOperator)`

参见下面的“[构建自己的操作符](#%E6%9E%84%E5%BB%BA%E8%87%AA%E5%B7%B1%E7%9A%84%E6%93%8D%E4%BD%9C%E7%AC%A6)”。

之前的 `toPromise()` “操作符”已经被移除了，因为一个操作符应该返回 `Observable`，而不是 `Promise` 。现在使用 `Observable.toPromise()` 的实例方法来替代。

因为 `throw` 是关键字，你可以在导入时使用 `_throw`，就像这样: `import { _throw } from 'rxjs/observable/throw'` 。

如果前缀`_`使你困扰的话 (因为一般前缀`_`表示“_内部的 - 不要使用_”) ，你也可以这样做:

```
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
...
const e = ErrorObservable.create(new Error('My bad'));
const e2 = new ErrorObservable(new Error('My bad too'));
```

## 为什么需要 pipeable 操作符？

打补丁的操作符主要是为了链式调用，但它存在如下问题:

1. 任何导入了补丁操作符的库都会导致该库的所有消费者的 `Observable.prototype` 增大，这会创建一种依赖上的盲区。如果此库移除了某个操作符的导入，这会在无形之中破坏其他所有人的使用。使用 pipeable 操作符的话，你必须在每个用到它们的页面中都导入你所需要用到的操作符。

2. 通过打补丁的方式将操作符挂在原型上是无法通过像 rollup 或 webpack 这样的工具进行“摇树优化” ( tree-shakeable ) 。而 pipeable 操作符只是直接从模块中提取的函数而已。

3. 对于在应用中导入的未使用过的操作符，任何类型的构建工具或 lint 规则都无法可靠地检测出它们。例如，比如你导入了 `scan`，但后来不再使用了，但它仍会被添加到打包后的文件中。使用 pipeable 操作符的话，如果你不再使用它的简化，lint 规则可以帮你检测到。

4. 函数组合 ( functional composition )很棒。创建自定义操作符也变得非常简单，它们就像 rxjs 中的其他所有操作符一样。你不再需要扩展 Observable 或重写 `lift` 。

## 什么是 pipeable 操作符？

简而言之，就是可以与当前的 `let` 操作符一起使用的函数。无论名称起的是否合适，这就是它的由来。基本上来说，pipeable 操作符可以是任何函数，但是它需要返回签名为 `<T, R>(source: Observable<T>) => Observable<R>` 的函数。

现在 `Observable` 中有一个内置的 `pipe` 方法 (`Observable.prototype.pipe`)，它可以用类似于之前的链式调用的方式来组合操作符 (如下所示)。

There is also a `pipe` utility function at `rxjs/util/pipe` that can be used to build reusable pipeable operators from other pipeable operators.

在 `rxjs/util/pipe` 中还有一个名为 `pipe` 的工具函数，它可用于构建基于其他 pipeable 操作符的可复用的 pipeable 操作符。

## 用法

你只需在 `'rxjs/operators'` (**注意是复数！**) 中便能提取出所需要的任何操作符。还推荐直接导入所需的 Observable 创建操作符，如下面的 `range` 所示:

```ts
import { range } from 'rxjs/observable/range';
import { map, filter, scan } from 'rxjs/operators';

const source$ = range(0, 10);

source$.pipe(
  filter(x => x % 2 === 0),
  map(x => x + x),
  scan((acc, x) => acc + x, 0)
)
.subscribe(x => console.log(x))
```

## 轻松创建自定义操作符

实际上，你可以_一直_用 `let` 来完成...，但是现在创建自定义操作符就像写个函数一样简单。注意，你可以将你的自定义操作符和其他的 rxjs 操作符无缝地组合起来。

```ts
import { interval } from 'rxjs/observable/interval';
import { filter, map, take, toArray } from 'rxjs/operators';

/**
 * 取每第N个值的操作符
 */
const takeEveryNth = (n: number) => <T>(source: Observable<T>) =>
  new Observable<T>(observer => {
    let count = 0;
    return source.subscribe({
      next(x) {
        if (count++ % n === 0) observer.next(x);
      },
      error(err) { observer.error(err); },
      complete() { observer.complete(); }
    })
  });

/**
 * 还可以使用现有的操作符
 */
const takeEveryNthSimple = (n: number) => <T>(source: Observable<T>) =>
  source.pipe(filter((value, index) => index % n === 0 ))

/**
 * 因为 pipeable 操作符返回的是函数，还可以进一步简化
 */
const takeEveryNthSimplest = (n: number) => filter((value, index) => index % n === 0);

interval(1000).pipe(
  takeEveryNth(2),
  map(x => x + x),
  takeEveryNthSimple(3),
  map(x => x * x),
  takeEveryNthSimplest(4),
  take(3),
  toArray()
)
.subscribe(x => console.log(x));
// [0, 2304, 9216]
```

## 已知问题

### TypeScript < 2.4

在2.3及以下版本的 TypeScript 中，需要在传递给操作符的函数中添加类型，因为 TypeScript 2.4之前的版本无法推断类型。在TypeScript 2.4中，类型可以通过组合来正确地推断出来。

**TS 2.3及以下版本**

```ts
range(0, 10).pipe(
  map((n: number) => n + '!'),
  map((s: string) => 'Hello, ' + s),
).subscribe(x => console.log(x))
```

**TS 2.4及以上版本**

```ts
range(0, 10).pipe(
  map(n => n + '!'),
  map(s => 'Hello, ' + s),
).subscribe(x => console.log(x))
```

### 构建和摇树优化

当从清单文件导入(或重新导出)时，应用的打包文件有时会增大。现在可以从 `rxjs/operators` 导入 pipeable 操作符，但如果不更新构建过程的话，会经常导致应用的打包文件更大。这是因为默认情况下 `rxjs/operators` 会解析成 rxjs 的 CommonJS 输出。

为了使用新的 pipeable 操作符而不增加打包尺寸，你需要更新 Webpack 配置。这只适用于 Webpack 3+ ，因为需要依赖 Webpack 3中的新插件 `ModuleConcatenationPlugin` 。

**路径映射**

伴随 rxjs 5.5版本一同发布的是使用ES5 和 ES2015 两种语言级别的 ECMAScript 模块格式 (导入和导出)。你可以在 `node_modules/rxjs/_esm5` 和 `node_modules/rxjs/_esm2015` 下面分别找到这两个分发版本 ("esm"表示 ECMAScript 模块，数字"5"或"2015"代表 ES 语言级别)。在你的应用源码中，你应该从 `rxjs/operators` 导入，但在 Webpack 配置文件中，你需要将导入重新映射为 ESM5 (或 ESM2015) 版本。

如果 `require('rxjs/_esm5/path-mapping')`，你将接收一个函数，该函数返回一个键值对的对象，该对象包含每个输入映射到磁盘上的文件位置。像下面这样使用该映射:

**webpack.config.js**

简单配置:

<!-- skip-example -->
```js
const rxPaths = require('rxjs/_esm5/path-mapping');
const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: 'index.js',
  output: 'bundle.js',
  resolve: {
    // 使用 "alias" 键来解析成 ESM 分发版
    alias: rxPaths()
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
};
```

更多完整配置 (接近真正场景):

<!-- skip-example -->
```js
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const rxPaths = require('rxjs/_esm5/path-mapping');

var config = {
    devtool: isProd ? 'hidden-source-map' : 'cheap-eval-source-map',
    context: path.resolve('./src'),
    entry: {
        app: './index.ts',
        vendor: './vendor.ts'
    },
    output: {
        path: path.resolve('./dist'),
        filename: '[name].bundle.js',
        sourceMapFilename: '[name].map',
        devtoolModuleFilenameTemplate: function (info) {
            return "file:///" + info.absoluteResourcePath;
        }
    },
    module: {
        rules: [
            { enforce: 'pre', test: /\.ts$|\.tsx$/, exclude: ["node_modules"], loader: 'ts-loader' },
            { test: /\.html$/, loader: "html" },
            { test: /\.css$/, loaders: ['style', 'css'] }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"],
        modules: [path.resolve('./src'), 'node_modules'],
        alias: rxPaths()
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': { // eslint-disable-line quote-props
                NODE_ENV: JSON.stringify(nodeEnv)
            }
        }),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new HtmlWebpackPlugin({
            title: 'Typescript Webpack Starter',
            template: '!!ejs-loader!src/index.html'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity,
            filename: 'vendor.bundle.js'
        }),
        new webpack.optimize.UglifyJsPlugin({
            mangle: false,
            compress: { warnings: false, pure_getters: true, passes: 3, screw_ie8: true, sequences: false },
            output: { comments: false, beautify: true },
            sourceMap: false
        }),
        new DashboardPlugin(),
        new webpack.LoaderOptionsPlugin({
            options: {
                tslint: {
                    emitErrors: true,
                    failOnHint: true
                }
            }
        })
    ]
};

module.exports = config;
```

**无法控制构建过程**

如果你无法控制构建过程(或者无法更新至 Webpack 3+)的话，上述解决方案将不适合你。所以，从 `rxjs/operators` 导入很可能让应用的打包文件尺寸更大。但还是有解决办法的，你需要使用更深一层的导入，有点类似于5.5版本之前导入 pipeable 操作符的方式。

将:

```ts
import { map, filter, reduce } from 'rxjs/operators';
```

变成:

```ts
import { map } from 'rxjs/operators/map';
import { filter } from 'rxjs/operators/filter';
import { reduce } from 'rxjs/operators/reduce';
```