# ExHentaiReader
## 0、更新  
1、放弃了jquery，全部使用js实现，减少了加载库，提升运行效率  
2、等待标识更加直观，改用顶部热力条的形式显示加载成功与未成功的图片  
3、添加了重新加载和图片换源功能，再次执行标签即可对未加载的图片进行换源  
## 1、使用效果
**使用前：**  
<img align=center src='https://raw.githubusercontent.com/manakanemu/ExHentaiReader/master/describe/before.jpg' width='220px' height='480px'>  
**使用后：**  
<img align=center src='https://raw.githubusercontent.com/manakanemu/ExHentaiReader/master/describe/after.gif' width='220px' height='480px'>     
## 2、阅读器安装方法  
手机浏览器随便打开一个网页，添加书签，然后用**下面这段代码**替换掉书签的地址

```
javascript:var s = document.createElement('script'); s.setAttribute('step',20); s.setAttribute('src','https://manakanemu.github.io/ExHentaiReader/Reader.js?'+parseInt(Date.parse(new Date())/1000)); s.setAttribute('id','exReader'); document.body.appendChild(s);
```
  
## 3、使用方法
* 打开本子页面，点击书签即可运行。  
* 运行脚本后，页面上方会浮动显示加载热力条，绿色部分为加载完成部分，红色部分为加载未完成部分。消失或全部变绿表示图片全部加载完成。
* 如果长时间未加载完成，可以重新点击运行本脚本，脚本会自动更换图片源。



## 4、问题说明
* 本人只有ios设备，故没有对安卓设备的浏览器进行测试，脑测应该没问题。  
* 如果有任何意见、建议或其他想说的，请直接发issue。  
* 本项目依旧在改进中，当前可以一次性加载一页的本子，计划改成异步加载全部本子内容，同时优化代码
