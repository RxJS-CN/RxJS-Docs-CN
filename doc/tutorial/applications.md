# 创建应用

RxJS 是个很好的工具，可以让你的代码更少出错。它是通过使用无状态的纯函数来做到这点的。但是应用是有状态的，那么我们如何将 RxJS 的无状态世界与我们应用的有状态世界连接起来呢？

我们来创建一个只存储值为`0`的简单状态。每次点击我们想要增加存储在状态中的 count 。

```js
var button = document.querySelector('button');
Rx.Observable.fromEvent(button, 'click')
  // 对流进行 scan (reduce) 操作，以获取 count 的值
  .scan(count => count + 1, 0)
  // 每次改变时都在元素上设置 count
  .subscribe(count => document.querySelector('#count').innerHTML = count);
```

所以产生状态是在 RxJS 的世界中完成的，但最后一行代码中改变 DOM 却是一种副作用。

## 状态和存储 (State Store)

应用使用状态和存储来保持状态。状态存储在不同的框架中有着不同的名称，像 store、reducer 和 model ，但重点是它们都只是普通的对象。我们还需要处理的是多个 observables 可以更新同一个状态存储。

```js
var increaseButton = document.querySelector('#increase');
var increase = Rx.Observable.fromEvent(increaseButton, 'click')
  // 我们映射到一个函数，它会改变状态
  .map(() => state => Object.assign({}, state, {count: state.count + 1}));
```

我们在这所做的是将点击事件映射成改变状态的函数。所以我们映射到一个函数，而不是映射到一个值。函数会改变状态存储中的状态。那么现在我们来看下如何实际地做出改变。

```js
var increaseButton = document.querySelector('#increase');
var increase = Rx.Observable.fromEvent(increaseButton, 'click')
  .map(() => state => Object.assign({}, state, {count: state.count + 1}));

// 我们使用初始状态创建了一个对象。每当状态发生变化时，我们会接收到改变状态的函数，
// 并把状态传递给它。然后返回新的状态并准备在下次点击后再次更改状态。
var state = increase.scan((state, changeFn) => changeFn(state), {count: 0});
```

现在我们还可以再添加几个 observables ，它们同样也可以更改同一个状态存储。

```js
var increaseButton = document.querySelector('#increase');
var increase = Rx.Observable.fromEvent(increaseButton, 'click')
  // 我们再一次映射到一个函数，它会增加 count
  .map(() => state => Object.assign({}, state, {count: state.count + 1}));

var decreaseButton = document.querySelector('#decrease');
var decrease = Rx.Observable.fromEvent(decreaseButton, 'click')
  // 我们还是映射到一个函数，它会减少 count 
  .map(() => state => Object.assign({}, state, {count: state.count - 1}));

var inputElement = document.querySelector('#input');
var input = Rx.Observable.fromEvent(inputElement, 'keypress')
  // 我们还将按键事件映射成一个函数，它会产生一个叫做 inputValue 状态
  .map(event => state => Object.assign({}, state, {inputValue: event.target.value}));

// 我们将这三个改变状态的 observables 进行合并
var state = Rx.Observable.merge(
  increase,
  decrease,
  input
).scan((state, changeFn) => changeFn(state), {
  count: 0,
  inputValue: ''
});

// 我们订阅状态的变化并更新 DOM
state.subscribe((state) => {
  document.querySelector('#count').innerHTML = state.count;
  document.querySelector('#hello').innerHTML = 'Hello ' + state.inputValue;
});

// 为了优化渲染，我们可以检查什么状态是实际上已经发生变化了的
var prevState = {};
state.subscribe((state) => {
  if (state.count !== prevState.count) {
    document.querySelector('#count').innerHTML = state.count;
  }
  if (state.inputValue !== prevState.inputValue) {
    document.querySelector('#hello').innerHTML = 'Hello ' + state.inputValue;
  }
  prevState = state;
});
```

我们可以采用状态存储的方式，并且结合一些不同的框架和库来进行使用。

### Immutable JS

你还可以使用 [Immutable JS](https://facebook.github.io/immutable-js/) 来为你的应用创建一个全局的状态存储。Immutable JS 是创建不变的状态存储的好方法，它允许你通过对更改的值进行浅检查来优化渲染。

<!-- skip-example -->
```js
import Immutable from 'immutable';
import someObservable from './someObservable';
import someOtherObservable from './someOtherObservable';

var initialState = {
  foo: 'bar'
};

var state = Observable.merge(
  someObservable,
  someOtherObservable
).scan((state, changeFn) => changeFn(state), Immutable.fromJS(initialState));

export default state;
```

现在，你可以在使用的任何 UI 层中导入状态。

<!-- skip-example -->
```js
import state from './state';

state.subscribe(state => {
  document.querySelector('#text').innerHTML = state.get('foo');
});
```

### React

我们来看一个示例，当组件进入 `componentDidMount` 生命周期事件时订阅 observable，而当进入 `componentWillUnmount` 生命周期事件时取消订阅。

<!-- skip-example -->
```js
import messages from './someObservable';

class MyComponent extends ObservableComponent {
  constructor(props) {
    super(props);
    this.state = {messages: []};
  }
  componentDidMount() {
    this.messages = messages
      // 在数组中累积我们的消息
      .scan((messages, message) => [message].concat(messages), [])
      // 当得到一条新消息时进行渲染
      .subscribe(messages => this.setState({messages: messages}));
  }
  componentWillUnmount() {
    this.messages.unsubscribe();
  }
  render() {
    return (
      <div>
        <ul>
          {this.state.messages.map(message => <li>{message.text}</li>)}
        </ul>
      </div>
    );
  }
}

export default MyComponent;
```

还有许多其他的方式可以使用 React 和 observables。看看这些：

- [rxjs-react-component](https://www.npmjs.com/package/rxjs-react-component)。它允许你暴露映射到状态更改的 observable 。还可以使用 observable 版的生命周期钩子。