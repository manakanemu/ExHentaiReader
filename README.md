# ExHentaiReader
## 0、更新  
更新了阅读器注入的逻辑以及显示图片的策略，先快速加载部分图片，之后再加载全部图片。  

## 1、使用效果
**使用前：**  
<img src='https://github.com/skjgsk/ExHentaiReader/blob/master/describe/before.jpg' width='220px' height='480px'>  

**使用后：**  
![使用后](https://github.com/skjgsk/ExHentaiReader/blob/master/describe/after.gif)   
## 2、阅读器安装方法  
手机浏览器随便打开一个网页，添加书签，然后用**下面这段代码**替换掉书签的地址

```
javascript:var s = document.createElement('script'); s.setAttribute('step',10); s.setAttribute('src','https://manakanemu.github.io/ExHentaiReader/Reader.js?'+parseInt(Date.parse(new Date())/1000)); s.setAttribute('id','exReader'); document.body.appendChild(s);
```
修改`s.setAttribute('step',10)` 中的数字，可以控制先加载图片的数量，一般用户可以设为10-15，网速快的用户可以设的更高。
  
## 3、使用方法
* 打开本子页面，点击书签即可运行。  
* 运行脚本后，页面上方会浮动显示运行进度，分为**抽取地址**、**加载图片**、**加载完成**三种状态，图片加载完成后浮动文字会变成绿色的**加载完成**字样，三秒后自动消失。  
* 如果长时间未加载完成，可以重新点击运行本脚本，本脚本会重新加载图片。  



## 4、问题说明
* 本人只有ios设备，故没有对安卓设备的浏览器进行测试，脑测应该没问题。  
* 如果有任何意见、建议或其他想说的，请直接发issue。  
* 本项目依旧在改进中，当前可以一次性加载一页的本子，计划改成异步加载全部本子内容，同时优化代码
