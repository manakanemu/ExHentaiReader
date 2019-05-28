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