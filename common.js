//usage: [json1, json2].log()
//usage: [{key1: 3, key2: 4, key3: 5}, {key1: 44, key2: 11, key3: 35}].log('key1', 'key2')
Array.prototype.log = function(){
    var keys = arguments,
        hasKey = arguments.length > 0;
    for(var i = 0, l = this.length; i < l; i++){
        var item = this[i];
        if(hasKey){
            var r = [];
            for(var j = 0, len = arguments.length; j < len; j++){
                r.push(item[arguments[j]]);
            }
            console.log.apply(console, r);
        }else{
            console.log(item);
        }
    }
    return this;
};


// Array 的concat 好像跟2）中的string操作一样，
//先在内存中复制一个数组a，然后进行concat操作，最后把结果赋值给a,这样太消耗内存了，性能也挺差。
//经常得 这样写： a = a.concat(b). 
//哥写了个append，虽然简单，但实用，返回的还是数组本身，终于可以这样写了：
// a.append(b).append(c).append(d)
if(typeof Array.prototype.append!=="function"){
    Array.prototype.append=function(A){
        Array.prototype.splice.apply(this,[this.length,0].concat(A));
        return this
    }
}else{
    throw new Error("native append has been added to the Array.prototype, you better check it out!!!")
}

//数组分步执行
Array.prototype.chunk = function(fn, n, t, stepCallback, scope){
    var i = 0,
        slice = null,
        self = this,
        len = this.length,
        step = function(){
            slice = self.slice(i, n+i);
            slice.each(fn, scope);
            i += n;
            if(stepCallback){stepCallback();}
            if(i < len){
                setTimeout(step, t);
            }
        };
    step();
};


// JavaScript： 限制一个函数触发频率
// 这个函数接受2个参数： 要限制的函数： fn, 间隔的时间： t;

// 比如说你给一个图像绑定 mousemove 事件时，你想限制mousemove事件的触发频率为最多500毫秒触发一次。
/*
function changeCursor(elm, e){

    var isLeft, cursor = '';

　if(isLeft){
        elm.style.cursor = 'url("./left.cur"), auto';

    }else{

        cursor = 'right.cur';

    }

   elm.style.cursor =  'url("./' + cursor +　'"), auto';

}

var after = restrain(changeCursor, 500);

function handleMouseMove(e){

    e = e || window.event;
    after(e.target || e.srcElement, e);

}
*/



var restrain = function(fn, t){
    var running = false
    return function(){
        if(running){return;}
        running = true;
        fn.apply(null, arguments);
        setTimeout(function(){running = false;}, t);
    };
};

 


//老是忘记删除console，封装一下，这样就ie就不报错了
(function(){
    if (!window.console) {
        var dummy = function(){};
        window.console = {
            log: dummy,
            info: dummy,
            debug: dummy,
            profile: dummy
        };
    }
    'info debug, profile'.split(' ').each(function(item){
       if(!console[item]){
           console[item] = console.log;
       }
    });
})();





//使用事件代理最大的好处就是省内存吧估计，也方便在退推出页面之前停止事件监听
//下面这个函数是根据元素的className来判断需要响应的函数，其实用个自定义的属性更好，比如cmd，看起来也顺眼
function dummy(){}
var arr = [
	{
	    name: 'className1',
	    exec: function(event, element){dummy();}
	},
	{
	    name: 'className21',
	    exec: function(event, element){dummy();}
	}

];

document.body.addEventListener('click', function(e){
    classDelegation(e, arr);
}, false);

function classDelegation (event, classNameArr){
    var element = event.target, matched = null, len = classNameArr.length, i;
    outerloop:
        do{
            i = len;
            innerloop:
                while(i--){
                    var item = classNameArr[i];
                    if(!item){continue;}
                    if($(element).hasClassName(item.name)){
                        matched = item;
                        break outerloop;
                        break innerloop;
                    }
                }
            element = element.parentNode;
        }while(element && element.nodeType === 1);
    if(matched){
        typeof matched.exec === 'function' && matched.exec(event, element);
        if(element.nodeName === 'A' && element.getAttribute('target') !== '_blank'){
            event.stop();
        }
        return {element: element, item: matched};
    }
    return null;
};



//在prototype中，直接在Element上扩展就更方便了
(function(){
    function clickDelegation(element, arr){
        element.observe('click', function(event){
            var a = Element.classDelegation(event, arr);
        });
        return element;
    }
    Element.addMethods({
        clickDelegation: clickDelegation
    });
})();