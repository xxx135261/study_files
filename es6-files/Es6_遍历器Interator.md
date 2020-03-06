#### 1、Iterator遍历器
**任何数据结构只要部署 Iterator 接口，就可以完成遍历操作（即依次处理该数据结构的所有成员）**

作用：
1. 为各种数据结构，提供一个统一的，简便的访问接口；
2. 使得数据结构的成员能够按某种次序排列；
3. Es6创造了一种新的遍历命令,for...of循环，主要供for ... of消费。

Iterator的遍历过程:
1. 创建一个指针对象，指向当前数据结构的真实位置，也就是说，遍历器对象本质上就是一个指针对象。
2. 第一次调用指针对象的next方法，可以将指针指向数据结构的第一个成员。
3. 第二次调用指针对象的next方法，指针就指向数据结构的第二个成原。
4. 不断调用指针对象的next方法，直到指向数据结构的结束位置。

每次调用next方法，都会返回数据结构的当前成员的信息，就是value和done两个属相的对象。value是当前成员的值，done属性是一个布尔值，表示遍历是否结束。
例
```
var it = makeItrator(['a','b']);
it.next() // {value:'a',done:false}
it.next() // { value: "b", done: false }
it.next() // { value: undefined, done: true }

function makeIterator(array){
    var nextIndex = 0;
    return {
        next:function(){
            return nextIndex < array.length ?
                { value:array[nextIndex++],done:false } :
                { value:undefined,done:true};
        }
    }
}
```
调用指针对象的next方法，就可以遍历事先给定的数据结构。

以上遍历器也可以写成
```
function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function() {
      return nextIndex < array.length ?
        {value: array[nextIndex++]} :
        {done: true};
    }
  };
}

```