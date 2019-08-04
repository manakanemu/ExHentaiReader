window.step = document.getElementById('exReader').getAttribute('step')
console.log(step)


//图片加载状态函数
function imload() {
    window.loadcount++
    window.myinfo.css('color', '#C1328E')
    window.myinfo.text('已加载图片 ' + window.loadcount.toString() + '/' + window.imgSize.toString())
    if (window.loadcount == window.step) {
        for (var i = window.step; i < window.imgSize; i++) {
            getImgUrl(i, window.step, window.imgSize,false)
        }
    }
    if (window.loadcount >= window.imgSize) {
        window.myinfo.css('color', '#84FF98')
        window.myinfo.text('全部图片加载完成')
        setTimeout(function () {
            window.myinfo.remove()
        }, 3000);
    }
}
function resetImgUrl(imgObj, imgSrc, maxErrorNum) {
    if (maxErrorNum > 0) {
        imgObj.onerror = function () {
            reSetImgUrl(imgObj, imgSrc, maxErrorNum - 1);
        };
        setTimeout(function () {
            imgObj.src = imgSrc;
        }, 500);
    } else {
        imgObj.onerror = null;
        imgObj.src = "<%=basePath%>images/noImg.png";
    }
}
function getImgUrl(i, start, end,Preloading) {
    var container = $('#gdt')
    $.ajax({
        url: window.pageUrls[i],
        dataType: 'html',
        success: function (element) {
            var page = $(element);
            imgurl = page.find('#img').attr('src');
            window.imgUrls[i] = imgurl
            window.mycount++
            if(Preloading){
                window.myinfo.css('color', '#FFB11B')
                window.myinfo.text('抽取图片地址: ' + window.mycount*100/ end+'%')
            }
            if (window.mycount >= end) {
                window.isLoad = true
                container.append(window.myinfo)
                for (var j = start; j < end; j++) {
                    var img = $('<img class="exImage" style="width:100%;" src="' + window.imgUrls[j] + '" onload="imload()" onerror="resetImgUrl(this,this.src,3)">')
                    container.append(img)
                    container.append($('<hr style="width:100%;height:10px;background-color:yellow;margin:0px;">'));
                }
            }
        }
    })
}

if (!window.readerInit) {
    function initReader() {
        window.pageUrls = new Array()
        window.imgUrls = new Array()
        window.mycount = 0
        var container = $('#gdt')
        $('#gdt>div').each(function () {
            var div = $(this)
            if (div.attr('class') == 'gdtm' || div.attr('class') == 'gdtl') {
                pageurl = div.find('a').attr('href')
                window.pageUrls.push(pageurl)
            }
        })
        window.imgSize = window.pageUrls.length
        container.empty()
        window.readerInit = true
        container.attr('style', 'max-width:5000px;margin:0px;padding:0px;width:100%;display: flex;flex-flow: column nowrap;justify-content: flex-start;align-items: center;')
        window.myinfo = $('<span style="position: fixed;display: block;font-size: 50px;z-index: 99;top: 0px;left: 50%;transform: translateX(-50%)"></span>')
        container.prepend(window.myinfo)
        window.myinfo.css('color', '#d71345')
        window.loadcount = 0
        for (var i = 0; i < window.step; i++) {
            getImgUrl(i, 0, window.step,true)
        }
    }
    var jq = document.createElement('script')
    jq.setAttribute('src', 'https://cdn.staticfile.org/jquery/3.4.1/jquery.min.js')
    jq.setAttribute('onload', 'initReader()')
    document.body.appendChild(jq)
} else {
    var container = $('#gdt')
    container.empty()
    container.attr('style', 'max-width:5000px;margin:0px;padding:0px;width:100%;display: flex;flex-flow: column nowrap;justify-content: flex-start;align-items: center;')
    window.myinfo = $('<span style="position: fixed;display: block;font-size: 50px;z-index: 99;top: 0px;left: 50%;transform: translateX(-50%)"></span>')
    container.prepend(window.myinfo)
    window.myinfo.css('color', '#d71345')
    window.loadcount = 0
    for (var i = 0; i < window.step; i++) {
        getImgUrl(i, 0, window.step,true)
    }
}


// javascript:var s = document.createElement('script'); s.setAttribute('step',10); s.setAttribute('src','https://manakanemu.oss-cn-beijing.aliyuncs.com/show2.js?'+parseInt(Date.parse(new Date())/1000)); s.setAttribute('id','exReader'); document.body.appendChild(s);

