####  变量声明
##### 1、var
类似于JavaScript中的var，它可以接收任何类型的变量，但最大的不同是Dart中var变量一旦赋值，类型便会确定，则不能再改变其类型，如：


```
var t;
t="hi word";

t=100;
console.log(t);//会报错，因为t的类型一开始就确定为string,类型一旦确定就不能改变其类型。
```
###### 2、dynamic和Object
object是dart所有类型的根基类，也就是说所有类型都是Object的子类（包括function和null),所以任何类型的数据都可以赋值给Object声明的对象，dynamic与var一样，都是关键词，声明的变量可以赋值任意对象，而dynamic与Object相同之处在于，他们声明的变量可以后期改变赋值类型。而var是不可以的。
```
dynamic t;
Object x;
t='hi word';
x='hi Object';

t=100;  //此代码是没有问题的，值是可以改变的
x=100;
```

dynamic和Object不同的是，dynamic声明的对象编译器会提供所有可能的组合，而Object声明的对象只能使用Object的属性与方法。如：
```
dynamic a;
Object  b;
main() {
    a = "";
    b = "";
    pringtLength();
}
pringtLength(){
    print(a.length);  //没有警告
    print(b.length); //warning:The getter 'length' is not defined for the class 'Object'
}
```
###### 3、final和const
final和const类型的变量只能被设置一次，两者的区别在于：const变量是一个编译时常量，final变量在第一次使用时被初始化，被final或者const修饰的变量，变量类型可以省略，如：
```
//可以省略string这个类型声明
final str = 'hi word';//final String str = 'hi word';
const str = 'hi word';//const String str = 'hi word';
```
#### 函数
dart是面向对象的语言，所以即使是函数也是对象，并且有一个类型Function。这意味着函数可以赋值给变量或作为参数传递给其他函数。这是函数式编程的特征。
###### 1、函数声明

```
//dart函数声明如果没有显示声明返回类型时会默认当作dynamic处理。（函数类型值没有类型推断）
bool isNoble(init numbers){
    return _nobleGass[numbers] != null;  //不指定返回类型，此时默认为dynamic，不是bool
}


typedef bool CallBack();

void test(CallBack cb){
    print(cb());
}
test(isNoble);//报错，isNoble不是bool类型
```
###### 2、对于只包含一个表达式的函数，可以使用简写语法

```
bool isNoble (init numbers)=> __nobleGass[numbers] != null; 
```
###### 3、函数作为变量

```
var say = (str){
    print(str);
};
say('hi word');
```
###### 4、函数作为参数传递

```
void execute(var callBack){
    callBack();
}

execute(() => print('xxx'))
```
###### 5、可选的位置参数
包装一组函数参数。用[]标记为可选的位置参数。并放在参数列表的最后面：

```
String say(String from,String msg,[String device]){
    var result = '$from says $msg';
    if(device != null){
        result = '$result width a $device';
    }
    return result;
}

say('Bob','Howdy');//结果是:Bob says Howdy

say('Bob','Howdy','smoke signal');//结果是:Bob says Howdy smoke signal
```
###### 6、可选的命名参数
定义函数时。使用{param1,param2,...},放在参数列表的最后面，用指定命名参数。如：

```
//设置[bold]和[hidden]标志
void enableFlags({bool bold,bool hidden}){
    //...
}

enableFlags(bold:true,hidden:false);
```
#### 异步支持
##### Future
Future与JavaScript中的Promise非常相似，表示一个异步操作的最终完成（或失败）及其结果值的表示。简单来说，它就是用于处理异步操作的，异步处理成功了就执行成功的操作，异步处理失败了就捕获错误或者停止后续操作。一个Future只会对应一个结果，要么成功，要么失败

###### 1、Future.then

```
// 使用Future.delayed创建了一个延时任务
//（实际场景会是一个真正的耗时任务，比如一次网络请求），即2秒后返回结果字符串"hi world!"，
Future.delayed(new Duration(seconds:2),(){
    return 'hi word!';
}).then((data){
    print(data);
})
```
###### 2、Future.catchError
//如果异步任务发生错误，我们可以在catchError中捕获错误，我们将上面示例改为：

```
Future.delayed(new Duration(seconds: 2),(){
   //return "hi world!";
   throw AssertionError("Error");  
}).then((data){
   //执行成功会走到这里  
   print("success");
}).catchError((e){
   //执行失败会走到这里  
   print(e);
});

//then方法还有一个可选参数onError，我们也可以它来捕获异常：
Future.delayed(new Duration(seconds: 2), () {
    //return "hi world!";
    throw AssertionError("Error");
}).then((data) {
    print("success");
}, onError: (e) {
    print(e);
});
```
###### 3、Future.whenComplete
异步任务执行成功或失败都需要做一些事的场景，比如在网络请求前弹出加载对话框，在请求结束后关闭对话框.可以使用future的wehenComplete回调，我们将上面示例改一下:

```
Future.delayed(new Duration(seconds:2),(){
    throw AssertionError("Error");
}).then((data){
    print(data);
}).catchError((e){
    print(e);
}).whenComplete((){
    //无论成功失败都会走到这里
});
```
###### 3、Future.wait
有些时候我们组要等待多个异步任务都执行结束后才进行一些操作，比如我们有一个界面，需要先分别从两个网络接口获取数据，获取成功后，我们需要将两个接口数据进行特定的处理后再显示到ui界面上，在这种情况下我们可以使用Future.wait。它接收一个future数组参数，只有数组中所有future都执行成功后，才触发then的成功回调，只有一个future执行失败，就会触发错误的回调。

```
Future.wait([
  // 2秒后返回结果  
  Future.delayed(new Duration(seconds: 2), () {
    return "hello";
  }),
  // 4秒后返回结果  
  Future.delayed(new Duration(seconds: 4), () {
    return " world";
  })
]).then((results){
  print(results[0]+results[1]);
}).catchError((e){
  print(e);
});
```
###### 4、回调地狱处理

```
login("alice","******").then((id){
      return getUserInfo(id);
}).then((userInfo){
    return saveUserInfo(userInfo);
}).then((e){
   //执行接下来的操作 
}).catchError((e){
  //错误处理  
  print(e);
});
```
###### 5、async/await消除callback hell

```
task() async{
    try{
        String id = await login('alice','xxxxxx');
        String userInfo = await getUserInfo(id);
        await saveUserInfo(userInfo);
    }.catch(e){
        print(e);
    }
}
```
- async用来表示函数是异步的，定义的函数会返回一个Future对象，可以使用then方法添加回调函数。
- await 后面是一个Future，表示等待该异步任务完成，异步完成后才会往下走；await必须出现在 async 函数内部。

#### Stream

stream也是用于接收异步事件数据，和future不同的是，它可以接收多个异步操作的结果（成功或失败）。也就是说，在异步执行任务时，可以通过多次触发成功或失败事件来传递结果数据或错误异常。Stream常用于会多次读取数据的异步任务场景。如网络下载，文件读写等，例：

```
Stream.fromFutures([
    //1秒后返回
    Future.delayed(new Duration(seconds:1),(){
        return 'hello 1';
    }),
    //抛出一个异常
    Future.delayed(new Duration(seconds:2),(){
        throw AssertionError("Error");
    }),
    //3秒后返回
    Future.delayed(new Duration(seconds:3),(){
        return 'hello 3';
    })
]).listen((data){
    print(data);
},onError:(e){
    print(e.message);
},onDone:(){
    
})
```
上面的代码依次会输出：

```
I/flutter (17666): hello 1
I/flutter (17666): Error
I/flutter (17666): hello 3
```






