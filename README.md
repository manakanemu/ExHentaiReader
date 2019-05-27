# ExHentaiReader
## 0、前言
    本人是一名初学js的大学生，还在学习中。
    本项目作为练习产物，如有任何代码不规范，命名不规范问题等一些列问题，请多包涵。
## 1、使用效果
readme文件正在施工中，阅读器本身可用
## 2、阅读器安装方法
将下面的代码保存为书签，在打开对应本子后，点击本标签

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
打开本子运行书签即可，详细说明施工中

## 4、问题说明
如果有任何意见、建议请直接发issue
