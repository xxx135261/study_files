#### 对象的新增方法
##### 1、 Object.is()
用来比较两个值是否==严格==相等，与严格比较运算符‘===’的行为基本一致。

```
Object.is('foo','foo')  //true
Object.is({},{}) //false
```
不同之处只有两点：
1、+0不等于-0
2、NaN等于自身

```
+0 === -0  //true
NaN === NaN //false

Object.is(+0,-0) //false
Object.is(NaN,NaN)  //true
```
Es5可以通过以下方法，部署Object.is()

```
Object.defineProperty(Object,"is",{
    value:function(x,y) {
        if(x === y){
            //针对+0不等于-0的情况
            return x !== 0 || 1/x === 1/y;
        }
        //针对NaN的情况
        return x !== x && y !== y;
    },
    cinfigurable:true,
    enumerable:false,
    writable:true
});
```
##### 2、Object.assign()

Object.assign()方法用于对像的合并，将原对象的所有可枚举属性，复制到目标对象

```
const target = { a:1 }
const source1 = { b:2 }
const source2 = { c:3 }

Object.assign(target,source1,source2)
console.log(target)  //{a:1,b:2,c:3}
```
Object.assign方法的第一个参数是目标对象，后面的参数都是源对象。如果目标对象与源对象有同名属性，或多个源对象有重名属性，则后面的属性会覆盖前面的属性。
##### 注意点
##### （1）浅拷贝,深拷贝

###### 浅拷贝
Object.assign方法实行的是浅拷贝，而不是深拷贝，也就是说，如果源对象某个属性的值是对象，那么目标对象拷贝得到的是这个对象的引用。

```
const obj1 = {a:{b:1});
const obj2 = Object.assign({},obj1);
obj1.a.b = 2;
obj2.a.b  //2
```
上面代码中，源对象obj1的a属性的值是一个对象，Object.assign拷贝得到的是这个对象的引用。这个对象的任何变化，都会反映到目标对象上面.
###### 深拷贝

深拷贝会拷贝原对象的所有层级的属性，并且不受原对象的影响。
```
let obj = {a:0,b:{c:0}}
let obj2 = JSON.parse(JSON.stringify(obj));
obj.a = 4;
obj.b.c = 4;
console.log(obj2);//{a:0,b:{c:0}}
```
可以递归去复制所有层级属性
```
function deepClone(obj){
    let objClone = Array.isArray(obj)?[]:{}
    if(obj && typeOf obj === 'object'){
        for(key in obj){
            if(obj.hasOwnProperty(key)){
                //判断ojb子元素是否为对象，如果是，递归复制
                if(obj[key] && typeOf obj[key] === 'object'){
                    objClone[key] = deepClone(obj[key])
                }else{
                    objClone[key] = obj[key]
                }
            }
        }
        return objClone;
    }
}

let a = [1,2,3,4];
let b = deepClone(a);
a[0] = 2;
console.log(a); //[2,2,3,4]
console.log(b);  //[1,2,3,4]

```


（2）同名属性的替换

对于上述嵌套的对象，一旦遇到同名属性，Object.assign的处理方法是替换，而不是添加。
```
const target = { a:{b:2,c:4,d:9}}
const source = { a:{b:'hello'}}
object.assign(target,source) // {a:{b:'hello'}}
```
(3)数组的处理

```
Object.assign([1, 2, 3], [4, 5]) //[4,5,3]
相当于把Object.assign({0:1,1:2,2:3},{0:4,1:5})//相同的属性被替换了
```
(4)取值函数的处理

object.assign只能进行值的复制，如果要复制的值是一个取值函数，那么将求值后再复制。
```
const source = {
    get foo() {
        return 1;
    }
}
const target = {};
Object.assign(target,source);  //{foo:1}
```



