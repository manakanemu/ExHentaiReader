# ExHentaiReader  
## 插件版(正式版)  
基于浏览器的exHentai阅读器，通过js重构页面，无需下载应用。可以搭配Alook浏览器实现脚本自动执行。主要为了解决iOS用户随时兴起掏出来想来一发但是发现app过期需要重签的问题，
###
* [0 更新](#0-更新)  
* [1 使用效果](#1-使用效果)  
* [2 安装方法](#2-安装方法)  
* [3 使用方法](#3-使用方法)  
* [4 说明](#4-说明)
* [5 更新计划](#5-更新计划)
* [6 已知问题](#6-已知问题)  


### 0 更新  
1、更新了[V2 Beta版](describe/README.md)，添加懒加载功能，可视化配置，UI优化等功能。尝鲜可以用如下代码替换旧版代码：
```javascript:(function(){var s=document.createElement("script");s.setAttribute("id","exReader");s.setAttribute("src","https://manakanemu.github.io/ExHentaiReader/Reader_V2.min.js?");document.body.appendChild(s);}())```
### 1 使用效果
**使用前：**  
<img align=center src='https://raw.githubusercontent.com/manakanemu/ExHentaiReader/master/describe/1.jpg' width='220px' height='480px'>  
**使用后：**  

|移动端布局优化|图片铺满|下滑功能栏|标签翻译|
|-------|---------|--------|------------|
|<img src='https://raw.githubusercontent.com/manakanemu/ExHentaiReader/master/describe/2.jpg' width='220px'>|<img src='https://raw.githubusercontent.com/manakanemu/ExHentaiReader/master/describe/3.jpg' width='220px'>|<img src='https://raw.githubusercontent.com/manakanemu/ExHentaiReader/master/describe/4.jpg' width='220px'>|<img src='https://raw.githubusercontent.com/manakanemu/ExHentaiReader/master/describe/5.jpg' width='220px'>|


### 2 安装方法  
手机浏览器随便打开一个网页，添加书签，然后用下面**代码生成器**中生成的代码替换掉书签的地址

[代码生成器(点这里)](https://manakanemu.github.io/ExHentaiReader/)  
  
### 3 使用方法
* 打开本子页面，点击书签即可运行。  
* 运行脚本后，页面上方会浮动显示加载热力条，绿色部分为加载完成部分，红色部分为加载未完成部分。消失或全部变绿表示图片全部加载完成。
* 下滑出现功能栏，功能栏从上到下分别为“滚动到最上方”、“滚动到最下方”、“恢复之前的观看位置”、“图片换源”、“原汁原味”
* 页面刷新或退出会自动记录观看位置，下次观看可使用“恢复之前的观看位置”恢复
* 如果图片长时间未全部加载完成，可以点击工具栏第四个“图片换源”更换图片来源
* **更优雅简便的使用方法，可以参见[此issue](https://github.com/manakanemu/ExHentaiReader/issues/2)**



### 4 说明
* 如果有任何意见、建议或其他想说的，请直接发issue。  
* 由于本人学习研究方向和web以及移动端app并不相关，缺乏相关UI设计经验，如果知道任何优秀的ios前端漫画案例，也可以发到issue里，感谢。
* 另：如果你曾经使用熊猫书签，但现在在发现有时候会出问题，可以试试[极简熊猫书签](https://manakanemu.github.io/ExHentaiReader/expanda/) 。极简书签只保留了登陆功能，并针对目前的exhentai逻辑进行改进，但极简书签并不保证持续更新。

### 5 更新计划
新版正在重构，添加懒加载、本地修改设置等功能。优化UI，向原生App对齐。
### 6 已知问题
*  iPad等类5:4屏幕的显示错位问题

