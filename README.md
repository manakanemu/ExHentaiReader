# ExHentaiReader
## 0、前言
本人是一名初学js的学生，还在学习中。
本项目作为练习产物，如有代码不规范，命名不规范问题等一系列问题，请多包涵。
## 1、使用效果
**使用前：**  
<img src='https://github.com/skjgsk/ExHentaiReader/blob/master/describe/before.jpg' width='220px' height='480px'>  

**使用后：**  
![使用后](https://github.com/skjgsk/ExHentaiReader/blob/master/describe/after.gif)   
## 2、阅读器安装方法  
手机浏览器随便打开一个网页，添加书签，然后用**下面这段代码**替换掉书签的地址

```
javascript:
function loadReader() {
    $('body').append($('<script src="https://skjgsk.github.io/ExHentaiReader/EXShowImg.js" id="readerJs" value="10"></script>'));
}
if (document.getElementById('readerJs')) {
    if(window.isLoad){
        var container = $('#gdt');
        window.myinfo = $('<span style="position:fixed;display:block;font-size:50px;z-index:99;top:0px;left:50%;transform:translateX(-50%)"></span>');
        window.mycount = 0;
        container.empty();
        container.attr('style', 'max-width:5000px;margin:0px;padding:0px;width:100%;display:flex;flex-flow:column nowrap;justify-content:flex-start;align-items:center;');
        window.myinfo.css('color', '#FF3344');
        window.myinfo.text('已加载图片 ' + window.mycount.toString() + '/' + window.mysize.toString());
        container.append(window.myinfo);
        for (var j   =  0  ;  j   <  window.mysize  ;  j++){
            container.append($('<img style="width:100%;" src="'+window.imgUrls[j]+'" onload="imload()">'));
            container.append($('<hr style="width:100%;height:10px;background-color:yellow;margin:0px;">'));
        }
        function  imload() {
            window.mycount++;
            window.myinfo.text('已加载图片 ' + window.mycount.toString() + '/' + window.mysize.toString());
            if (window.mycount   >=  window.mysize) {
                window.myinfo.css('color', '#84FF98');
                window.myinfo.text('全部图片加载完成');
                setTimeout(function() {
                    window.myinfo.remove(); 
                }, 3000); 
            } 
        }
    }
} else {
    window.isLoad = false;
    var jqueryJs = document.createElement('script');
    jqueryJs.setAttribute('src', 'https://cdn.staticfile.org/jquery/3.4.1/jquery.min.js');
    jqueryJs.setAttribute('onload', 'loadReader()');
    document.body.appendChild(jqueryJs);
}
```
## 3、使用方法
* 打开本子页面，点击书签即可运行。  
* 运行脚本后，页面上方会浮动显示运行进度，分为**获取图片地址**、**加载图片**、**加载完成**三种状态，图片加载完成后浮动文字会变成绿色的**加载完成**字样，三秒后自动消失。  
* 如果长时间未加载完成，可以重新运行本脚本，本脚本会重新加载图片。（目前利用浏览器缓存重新加载，未来会设计更合理的加载逻辑）  



## 4、问题说明
如果有任何意见、建议请直接发issue
本项目依旧在改进中，当前可以一次性加载一页的本子，计划改成异步加载全部本子内容，同时优化代码
