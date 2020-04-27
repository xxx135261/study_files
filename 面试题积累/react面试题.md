##### 1、什么时候使用状态管理器
- 某个组件的状态需要共享，实现组件的通讯
- 某个状态需要在任何地方都可以拿到
- 跨级的组件需要更改另一个组件的状态
##### 2、componentWillUpdate可以直接修改state的值吗
- 不可以，这样的话会无限循环
- react组件在每次需要重新渲染时都会调用componentWillUpdate()
- 例如我们每次在调用this.setState的时候
- 这个函数中我们之所以不调用setState,是因为该方法会触发另外一个componentWillUpdate(),这样的话就会无限循环下去。

##### 3、说说你对react的渲染原理的理解
1、react是通过diff算法，来对比两次的dom不同部分进行渲染。
2、它渲染的过程有三个阶段，挂载期，更新期，卸载期
3、渲染过程：
- componentWillmount,渲染前的运行函数；
- componentDidmount,在第一次渲染后调用，在这个组件中进行ajax的请求；
- componentWillReceiveProps,在组件接收到一个新的prop时调用（更新后），这个方法在组件render时不会被调用；
- shouldComponentUpdate,返回一个布尔值，决定组件是否重新渲染，在组件接收到新的props或者state时被调用；
- componentWillUpdate,在组件接收到新的props或state时，但还没有调用render时调用，第一次渲染前调用；
- componentDidUpdate,在组建完成更新后立即调用；
- componentWiiUnmount,在组建从dom中移除之前立即调用；
4、setState是异步执行的，提升性能；
5、单项的数据流，指的是从数据层的变化去影响视图层的变化，数据驱动视图的变化，只需关注数据就可以了；
##### 4、说说context有哪些属性
Context 可以让我们无须明确地传遍每一个组件，就能将值深入传递进组件树(跨组件传递）。
const mycontext = react.createContext();
- 1、mycontext.provider
```
const ThemeContext = React.createContext('light');
class App extends React.Component {
  render() {
    // 使用一个 Provider 来将当前的 theme 传递给以下的组件树。
    // 无论多深，任何组件都能读取这个值。
    // 在这个例子中，我们将 “dark” 作为当前的值传递下去(传递给<ThemedButton />组件)。
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}

// 中间的组件再也不必指明往下传递 theme 了。
function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

class ThemedButton extends React.Component {
  static contextType = ThemeContext;  //contextType 读取当前的 theme context，React 会往上找到最近的 theme Provider，然后使用它的值。
  render() {
    return <Button theme={this.context} />;
  }
}

```
- 2、mycontext.contextType
> 使用 this.context 来消费最近 Context 上的那个值。你可以在任何生命周期中访问到它，包括 render 函数中。

```
const mycontext = react.createContext();
class MyClass extends React.Component {
  componentDidMount() {
    let value = this.context;
    /* 在组件挂载完成后，使用 MyContext 组件的值来执行一些有副作用的操作 */
  }
  componentDidUpdate() {
    let value = this.context;
    /* ... */
  }
  componentWillUnmount() {
    let value = this.context;
    /* ... */
  }
  render() {
    let value = this.context;
    /* 基于 MyContext 组件的值进行渲染 */
  }
}
MyClass.contextType = mycontext;

```
- 3、mycontext.Consumer
```
<MyContext.Consumer>
  {value => /* 基于 context 值进行渲染*/}
</MyContext.Consumer>
```
- 4、mycontext.displayName
`context`对象接收一个名为`displayName`的property,`React DevTools` 使用该字符串来确定`context`要显示的内容。
```
const mycontext = React.createContext();
mycontext.displayName = 'MyDisplayName';

<mycontext.Provider>  //`MyDisplayName.Provider`在devTools中
<mycontext.Consumer>   //`MyDisplayName.Consumer`在devtools中
```
##### 5、contextType是什么，它有什么用？
定义当前组件要使用哪一个context
##### 6、render在什么时候会被触发？
- 1、当组件第一次挂载时
- 2、当使用`this.setState()`，同时还会触发子组件的render
- 3、当state发生变化时，PureComponent不会随着parent的render而重新render
- 4、当组件收到新的`props`，pure component会被重新render,包括他的children,哪怕它并没有用到这个变化
- 5、让shouldComponentUpdate 返回false，可以阻止component render
