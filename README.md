# ExHentaiReader  
## 插件版(正式版)  
### 0、更新  
1、放弃了jquery，全部使用js实现，减少了加载库，提升运行效率  
2、等待标识更加直观，改用顶部热力条的形式显示加载成功与未成功的图片  
3、添加了重新加载和图片换源功能，再次执行标签即可对未加载的图片进行换源  
### 1、使用效果
**使用前：**  
<img align=center src='https://raw.githubusercontent.com/manakanemu/ExHentaiReader/master/describe/1.PNG' width='220px' height='480px'>  
**使用后：**  
* 图片满屏:  

<img align=center src='https://raw.githubusercontent.com/manakanemu/ExHentaiReader/master/describe/2.PNG' width='220px' height='480px'>  

* 去顶端、去底端、恢复观看进度、换源等功能栏:  

<img align=center src='https://raw.githubusercontent.com/manakanemu/ExHentaiReader/master/describe/3.PNG' width='220px' height='480px'>  

* 更改原网页按钮尺寸:  

<img align=center src='https://raw.githubusercontent.com/manakanemu/ExHentaiReader/master/describe/4.PNG' width='220px' height='480px'>    

### 2、阅读器安装方法  
手机浏览器随便打开一个网页，添加书签，然后用下面**代码生成器**中生成的代码替换掉书签的地址

[代码生成器(点这里)](https://manakanemu.github.io/ExHentaiReader/)  
  
### 3、使用方法
* 打开本子页面，点击书签即可运行。  
* 运行脚本后，页面上方会浮动显示加载热力条，绿色部分为加载完成部分，红色部分为加载未完成部分。消失或全部变绿表示图片全部加载完成。
* 如果长时间未加载完成，可以重新点击运行本脚本，脚本会自动更换图片源。



### 4、问题说明
* 本人只有ios设备，故没有对安卓设备的浏览器进行测试，脑测应该没问题。  
* 如果有任何意见、建议或其他想说的，请直接发issue。  
* 本项目依旧在改进中，当前可以一次性加载一页的本子，计划改成异步加载全部本子内容，同时优化代码

### 5、备注
* 功能全部放在```Reader.js```中，如果你有延迟更低的服务器，可以把```Reader.js```放到自己的服务器上，并将javascript的：
``` 
s.setAttribute('src', 'https://manakanemu.github.io/ExHentaiReader/Reader.js?' + parseInt(Date.parse(new Date()) / 100));
```
字段中的路径改为自己的路径。 

## 框架版(测试版)  
### 1、使用效果  
一键注入脚本，重构网站，无需多次使用，目前正在优化逻辑，以及手机端Gui的适配  
<img align=center src='https://raw.githubusercontent.com/manakanemu/ExHentaiReader/master/describe/test.GIF' width='220px' height='480px'>     

### 2、安装方法   
手机浏览器随便打开一个网页，添加书签，然后用**下面这段代码**替换掉书签的地址

```
javascript:var s = document.createElement('script');s.setAttribute('src','https://manakanemu.github.io/ExHentaiReader/ReloadStructure.js?'+parseInt(Date.parse(new Date())/1000)); s.setAttribute('id','exReader'); document.body.appendChild(s);
```  
### 3、使用方法
1、打开exhentai主页，点击书签运行脚本
2、运行书签后页面会刷新，刷新后点击预览本子即可

### 4、问题说明  
框架版目前只是测试版，只有在直接点击本子的时候会自动进入阅读模式，在新标签打开的无效。脚本注入后无法搜索关键词，目前只能先搜索关键词之后再使用脚本。还可能有其他bug。我目前正在继续优化代码逻辑，并且正在编写能够适应手机的GUI，如果您有任何意见建议或bug反馈，请直接发issue。
 
