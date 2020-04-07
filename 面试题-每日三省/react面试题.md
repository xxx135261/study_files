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
- shouldComponentUpdat,返回一个布尔值，决定组件是否重新渲染，在组件接收到新的props或者state时被调用；
- componentWillUpdata,在组件接收到新的props或state时，但还没有调用render时调用，第一次渲染前调用；
- componentDidUpdat,在组建完成更新后立即调用；
- componentWiiUnmount,在组建从dom中移除之前立即调用；
4、setState是异步执行的，提升性能；
5、单项的数据流，指的是从数据层的变化去影响视图层的变化，数据驱动视图的变化，只需关注数据就可以了；