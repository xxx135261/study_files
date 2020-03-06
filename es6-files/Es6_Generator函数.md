#### 1、Generator函数
generator函数是es6提供的一种异步编程解决方案，也是遍历器生成函数。
##### 1、基本用法
使用function 关键字后加*的方式声明一个函数，该函数即为Generator函数

```
let tell = function* () {
    yield 1;
    yield 2;
}
let k = tell();
console.log(k.next()); //{value:1,done:false}
console.log(k.next()); //{value:2,done:false}
console.log(k.next());  //{value:undefined,done:true}
```
##### 2、添加遍历器
一个普通的obj对象默认是没有遍历器的，意味着不能使用for...of遍历，且不能使用...操作符解构。

```
let obj = {
    name:'zhangsan',
    age:18,
    sex:'man'
}
for(let value of obj){
    console.log(value);//报错，obj is not iterable
}
console.log([...obj])  //obj is not iterable
```
我们通过generator函数给其添加遍历器。

```
let obj = {
    name:'zhangsan',
    age:18,
    sex:'man'
}
obj[Symbol.iterator] = function* (){
    for(let key of obj){
        yeild obj[key];
    }
}

for(let value of obj) {
    console.log(value);//zhangsan 18 man
}
console.log([...obj]); //['zhangsan',18,'man']
```
##### 3、将ajax请求转成类似的 let a = ajax()的同步赋值形式
经常有一个业务内多个请求串联依赖,即后者依赖前者的请求结果，目前只能有两种做法。
- 回调函数嵌套
- 使用promise的.then进行链式调用

现在可以使用generator函数可以有第三种选择

- 将前一个网络请求的返回值赋值给一个变量，在下一个请求中使用
- 即以下形式

```
let a = 请求1(){}
let b = 请求2(){}

let res = 0;
//封装一个网络请求，不做实际动作，就打印一下参数param
function request(method,url,param,varibal){
    console.log(param);
    setTimeout((res)=> {
        let response = res++;
        varibal.next(response);
    },300)
}

let k;
let tell = function* (){
    //网络请求1
    let a = yield request('get','www.baidu.com',10,k);
    console.log(a); //0
    //网络请求2
    let b = yield request('get','www.baidu.com',a,k);
    console.log(b); //1
}
k = tell();
k.next();
```
##### 4、实现状态机

```
let state = function* (){
    while(1){
        yield 'block';
        yield 'none';
    }
}

let displayClass = state();
console.log(displayClass.next().value); //block
console.log(displayClass.next().value); //none
console.log(displayClass.next().value); //block
console.log(displayClass.next().value); //none
```
##### 5、实现轮询
```
//请求方法，返回值包括状态码和数据
let requestSing = function* (){
    yield new promise((r,i) => {
        setTimeout(()=> {
            r({code:304,data:{username:'zhangsan'}});
        },300)
    })
}

let requestFn = function() {
    let req = requestSing();
    let state = req.next();
    state.value.then((res)=>{
        if(res.code != 200){
            setTimeout(()=>{
                console.log('重新发送请求');
            },1000)
        }else{
            console.log(res.data);
        }
    })
}
requestFn();
```


