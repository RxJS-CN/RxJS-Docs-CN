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

What we do here is mapping a click event to a state changing function. So instead of mapping to a value, we map to a function. A function will change the state of our state store. So now let us see how we actually make the change.

```js
var increaseButton = document.querySelector('#increase');
var increase = Rx.Observable.fromEvent(increaseButton, 'click')
  .map(() => state => Object.assign({}, state, {count: state.count + 1}));

// We create an object with our initial state. Whenever a new state change function
// is received we call it and pass the state. The new state is returned and
// ready to be changed again on the next click
var state = increase.scan((state, changeFn) => changeFn(state), {count: 0});
```

We can now add a couple of more observables which will also change the same state store.

```js
var increaseButton = document.querySelector('#increase');
var increase = Rx.Observable.fromEvent(increaseButton, 'click')
  // Again we map to a function the will increase the count
  .map(() => state => Object.assign({}, state, {count: state.count + 1}));

var decreaseButton = document.querySelector('#decrease');
var decrease = Rx.Observable.fromEvent(decreaseButton, 'click')
  // We also map to a function that will decrease the count
  .map(() => state => Object.assign({}, state, {count: state.count - 1}));

var inputElement = document.querySelector('#input');
var input = Rx.Observable.fromEvent(inputElement, 'keypress')
  // Let us also map the keypress events to produce an inputValue state
  .map(event => state => Object.assign({}, state, {inputValue: event.target.value}));

// We merge the three state change producing observables
var state = Rx.Observable.merge(
  increase,
  decrease,
  input
).scan((state, changeFn) => changeFn(state), {
  count: 0,
  inputValue: ''
});

// We subscribe to state changes and update the DOM
state.subscribe((state) => {
  document.querySelector('#count').innerHTML = state.count;
  document.querySelector('#hello').innerHTML = 'Hello ' + state.inputValue;
});

// To optimize our rendering we can check what state
// has actually changed
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

We can take the state store approach and use it with many different frameworks and libraries.

### Immutable JS
You can also create a global state store for your application using [Immutable JS](https://facebook.github.io/immutable-js/). Immutable JS is a great way to create immutable state stores that allows you to optimize rendering by doing shallow checks on changed values.

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

Now you can import your state in whatever UI layer you are using.

<!-- skip-example -->
```js
import state from './state';

state.subscribe(state => {
  document.querySelector('#text').innerHTML = state.get('foo');
});
```

### React
Lets look at an example where we subscribe to an observable when the component mounts and unsubscribes when it unmounts.

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
      // Accumulate our messages in an array
      .scan((messages, message) => [message].concat(messages), [])
      // And render whenever we get a new message
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

There are many other ways to use observables with React as well. Take a look at these:

- [rxjs-react-component](https://www.npmjs.com/package/rxjs-react-component). It will allow you to expose observables that maps to state changes. Also use observables for lifecycle hooks
