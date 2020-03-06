#### Proxy
##### 1、代理
可以通过new Proxy(obj,{})创建一个obj对象的代理对象
```
let obj = {
    name:'zhangsan'
}
let objProxy = new Proxy(obj,{});
console.log(objProxy); //{name:'zhangsan'}
console.log(objProxy.name); //'zhangsan'
objProxy.name="xxx";
console.log(objProxy.name); //xxx
console.log(obj.name); //xxx
```
由上可知,代理对象几乎是源对象的完整映射--访问代理对象的属性相当于访问源对象的属性，设置代理对象的属性相当于设置源对象的属性。

Proxy构造函数的第二个参数为具体的代理配置项，配置如下
##### 2、代理项配置
###### 1、get代理--拦截所有源对象属相的访问对象
```
let obj = {
    name:'zhangsan'
}
let objProxy = new Proxy(obj,{
    get(target,key){
        console.log(terget,key);//{name:'zhangsan'} name
        return `我是通过代理对象拿到的源对象的值：${target[kay]}`
    }
});
console.log(objProxy.name);//我是通过代理对象拿到源对象的值：zhangsan
```
get函数的第一个参数target为源对象，第二个参数key为访问的源对象的对应属性的key
###### 2、set代理--拦截所有对源对象属性的设置动作
```
let obj = {
    name:'zhangsan'
}
let objProxy = new Proxy(obj,{
    set(target,key,value){
        if(key !== 'name'){  //不允许设置name属性
            target[key] = value;
        }
    }
})
objProxy.name ='xxx';
objProxy.age = 18;
console.log(objProxy);  //{name:'zhangsan',age:18}
console.log(obj);  //{name:'zhangsan',age:18}
```
###### 3、in操作符代理--拦截通过key in obj判断属性是否属于对象的操作
```
let obj = {
    name:'zhangsan',
    password:'123456'
}
let objProxy = new Proxy(obj,{
    has(target,key){
        if(key === 'password'){
            rturn false;
        }
    }
})
console.log('password' in objProxy); //false
console.log('password' in obj);  //true
```
###### 4、delete操作福代理--拦截通过delete操作符删除对象属性的动作
```
let obj = {
    name:'zhangsan',
    password:'123456'
}           
let objProxy = new Proxy(obj,{
    deleteProperty(target,key){
        if(key === 'password'){
            return target[key];
        }else{
            delete target[key];
        }
    }
});
delete objProxy.password;
console.log(objProxy); //{name:'zhangsan',password:'123456'}
delete obj.password;
console.log(obj);  //{name:'zhangsan'}
```
###### 5、键值访问拦截--通过Object.keys,Object.getOwnPropertyNames,Object.getOwnPropertySymbols等访问对象的键值得动作
```
let objs = {
    name:'zhansgan',
    password:'123456'
}
let objProxy = new Proxy(objs,{
    ownKeys(target){
        return Object.keys(target).filter((item)=>{
            if(item !== 'password'){
                return true;
            }
        })
    }
})
console.log(Object.keys(objProxy)); //['name']
```