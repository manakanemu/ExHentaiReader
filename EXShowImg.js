window.pageUrls = new Array()
window.imgUrls = new Array()
window.mycount = 0
window.myinfo = $('<span style="position: fixed;display: block;font-size: 50px;z-index: 99;top: 0px;left: 50%;transform: translateX(-50%)"></span>')
var container = $('#gdt')
container.prepend(window.myinfo)
$('#gdt>div').each(function(){
    var div = $(this)
    if(div.attr('class') == 'gdtm' || div.attr('class') == 'gdtl'){
        pageurl = div.find('a').attr('href')
        window.pageUrls.push(pageurl)
    }
})
window.mysize = window.pageUrls.length
window.myinfo.css('color','#80FFED')
window.myinfo.text('正获图片地址 '+window.mycount.toString()+'/'+window.mysize.toString())
function imload(){
    window.mycount++
    window.myinfo.text('已加载图片 '+window.mycount.toString()+'/'+window.mysize.toString())
    if(window.mycount >= window.mysize){
        window.myinfo.css('color','#84FF98')
        window.myinfo.text('全部图片加载完成')
        setTimeout(function(){
            window.myinfo.remove()
        }, 3000);
    }
}
function resetImgUrl(imgObj,imgSrc,maxErrorNum){  
    if(maxErrorNum > 0){  
          imgObj.onerror=function(){  
            reSetImgUrl(imgObj,imgSrc,maxErrorNum-1);  
          };  
          setTimeout(function(){  
              imgObj.src=imgSrc;  
          },500);  
      }else{  
          imgObj.onerror=null;  
          imgObj.src="<%=basePath%>images/noImg.png";  
      }  
  }
function getImgUrl(i){
    $.ajax({
        url:window.pageUrls[i],
        dataType:'html',
        success:function(element){
            var page = $(element);
            imgurl = page.find('#img').attr('src');
            window.imgUrls[i] = imgurl
            window.mycount ++
            window.myinfo.text('正获图片地址 '+window.mycount.toString()+'/'+window.mysize.toString())
            if(window.mycount >= window.mysize){
                window.isLoad = true
                window.mycount = 0
                container.empty()
                container.attr('style','max-width:5000px;margin:0px;padding:0px;width:100%;display: flex;flex-flow: column nowrap;justify-content: flex-start;align-items: center;')
                window.myinfo.css('color','#FF3344')
                window.myinfo.text('已加载图片 '+window.mycount.toString()+'/'+window.mysize.toString())
                container.append(window.myinfo)
                for(var j = 0 ; j < window.mysize ; j++){
                    var img = $('<img style="width:100%;" src="'+window.imgUrls[j]+'" onload="imload()" onerror="resetImgUrl(this,this.src,3)">')
                    container.append(img)
                    container.append($('<hr style="width:100%;height:10px;background-color:yellow;margin:0px;">'));
                }
            }
        }
    })
}

for(var i = 0 ; i < window.pageUrls.length;i++){
    getImgUrl(i)
}
