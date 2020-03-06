#### 1、set
==set==本身是一个构造函数，用来生成Set数据结构
```
##### 1、set不会添加重复的值
const s = new Set();
[2,3,4,5,2,2].forEach(item => s.add(item));

console.log(s); //[2,3,4,5]
```
##### 2、数组的去重
```
const array = [2,3,4,5,2,2,2,]
const setarr = [...new Set(array)]
console.log(setarr)  //[2,3,4,5]

//字符串的去重
const setStr = [...new Set('abaabbc')].join('')
console.log(setStr)   //'abc'
```
##### 3、在Set内部，两个NaN是相等的，两个对象总是不相等的
```
let set = new Set();
let a = NaN;
let b= NaN;
set.add(a);
set.add(b);

set //Set {NaN}

<!--两个对象不相等-->
set.add({});
set.size //1
set.add({});
set.size //2
set //Set(2) {{},{})
```
#### 2、set实例的属性和方法
属性
- ==Set.prototype.constructor==：构造函数，默认就是Set函数。
- ==Set.prototype.size==：返回Set实例的成员总数。
方法
- ==Set.prototype.add(value)==：添加某个值，返回 Set 结构本身。
- ==Set.prototype.delete(value)==：删除某个值，返回一个布尔值，表示删除是否
- ==Set.prototype.has(value)==：返回一个布尔值，表示该值是否为Set的成员。
- Set.prototype.clear()：清除所有成员，没有返回值。
#### 3、set遍历操作
遍历方法有四个
- Set.prototype.keys()：返回键名的遍历器
- Set.prototype.values()：返回键值的遍历器
- Set.prototype.entries()：返回键值对的遍历器
- Set.prototype.forEach()：使用回调函数遍历每个成员

entries方法返回的遍历器，同时包括键名和键值，所以每次输出一个数组，它的两个成员完全相等

```
let set = new Set(['red', 'green', 'blue']);
for(item of set.keys()){
    console.log(item)
}
//red green blue

for(let item of set.values()){
    console.log(item);
}
//red green blue

for(let item of set.entries()){
    console.log(item)
}
// ["red", "red"]
// ["green", "green"]
// ["blue", "blue"]

```
set结构的实例默认可遍历，它的默认遍历器生成函数就是它的values方法。

```
Set.property[Symbol.iterator] === Set.property.values
```
这意味这，可以省略values方法，直接用for...of循环遍历Set.
```
let set = new Set(['red', 'green', 'blue']);

for (let x of set) {
  console.log(x);
}
//red  green blue
```
set结构的实例和数组一样，也拥有forEach方法，用于对每个成员执行某种操作，没有返回值。
```
let set = new Set([1,4,9]);
set.forEach((value,key) => {
    console.log(key+':'+value)
})
// 1 : 1
// 4 : 4
// 9 : 9
```
#### 3、map
jiavascript的对象，本质上是键值对的集合，但是传统意义上只能用字符串当作键，这很大程度上有了限制，为了解决这种问题。ES6提供了==map==数据结构

如：DOM 节点作为对象data的键，但是由于对象只接受字符串作为键名，所以element被自动转为字符串[object HTMLDivElement]
```
let data = {};
let element = document.getElementById("myDiv");
data[element]='hahah';
console.log(data); //[object HTMLDivElement]: "hahah"
```
Map 数据结构,"键"的范围不限于字符串，各种类型的值（包括对象）都可以当作键，提供了“值——值”的对应。

- 向map添加成员
```
const m = new Map();
const p = {p:'hello world'};

m.set(o,'content')
m.get(o) //'content'

m.has(o) //true
m.delete(o) //true
m.has(o) //false
```
- Map接受一个数组作为参数，该数组的成员是一个个表示键值对的数组。
```
const map = new Map([
    ['name','张三'],
    ['title','这是便菩提']
])

console.log(map);  
//Map(2) {"name" => "张三", "title" => "这是便菩提"}
//[[Entries]]
//0: {"name" => "张三"}
//1: {"title" => "这是便菩提"}
//size: 2

map.size //2
map.get('name') //张三
map.has('title') //true
map.get('title')  //这是便菩提
```
Map构造函数接受数组最为参数，实际上执行的是下面的算法
```
const items = [
    ['name','张三'],
    ['title','Author']
]
const map = new Map();

items.forEach(([key,value]) => {
    map.set(key,value)
})
```




