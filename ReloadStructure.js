function showImgFrame() {
    if (document.getElementById('mainFrame').style.display != 'none') {
        window.originHref = document.getElementById('mainFrame').contentWindow.document.location.href
    }
    document.getElementById('mainFrame').style.display = 'none'
    document.getElementById('imgFrame').style.display = 'block'
    document.getElementById('topBar').style.display = 'flex'
}
function showMainFrame() {
    document.getElementById('imgFrame').contentWindow.document.body.innerHTML = ""
    document.getElementById('mainFrame').style.display = 'block'
    document.getElementById('imgFrame').style.display = 'none'
    document.getElementById('topBar').style.display = 'none'


}
function inExhentai() {
    var href = document.location.href
    if (href == 'https://exhentai.org/' || href.indexOf('https://exhentai.org/?') > -1 || href.indexOf('https://exhentai.org/tag/') > -1) {
        return true
    } else {
        return false
    }
}
function hideElement(element) {
    element.style.opacity -= 0.05
    if (element.style.opacity > 0) {
        requestAnimationFrame(function () {
            hideElement(element)
        })
    }
}
function barComplete(i) {
    hideElement(window.progressBars[i])
}
function imgLoadSuccess() {
    window.loaded++
    var imgFrame = document.getElementById('imgFrame').contentWindow
    var order = this.getAttribute('order')
    barComplete(order)
    if (window.loaded >= window.pageUrls.length) {
        hideElement(imgFrame.document.getElementById('barBox'))
    }
}
function imgLoadFailed() {
    this.setAttribute('src', this.src)
}
function loadImg(imgFrame, i, first) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', window.pageUrls[i], true)
    xhr.onload = function () {
        if (this.status === 200) {
            var imgUrl = this.responseText.match(/<img id=\"img\" src=\"(.+?)\"/i)[1]
            var nl = this.responseText.match(/onclick=\"return nl\(\'(.+?)\'\)\"/i)[1]
            window.imgUrls[i] = imgUrl
            window.nls[i] = nl
            var img = imgFrame.document.getElementById('img' + i)
            if (first) {
                var h = document.createElement('hr')
                h.setAttribute('style', 'width:100%;height:8px;background-color:yellow;margin:0px;')
                img.parentElement.insertBefore(h, img)
            }
            img.setAttribute('src', imgUrl)
        }
    }
    xhr.send()
}
function runReader(imgFrame) {
    var container = imgFrame.document.getElementById('gdt')
    if (!container) {
        return
    }
    var pageElements = container.getElementsByTagName('a')
    window.pageUrls = new Array()
    window.imgUrls = new Array()
    window.imgElements = new Array()
    window.progressBars = new Array()
    window.nls = new Array()
    window.loaded = 0

    var readerContainer = document.createElement('div')
    readerContainer.setAttribute('id', 'readerContainer')
    container.parentElement.insertBefore(readerContainer, container)
    var barBox = document.createElement('div')
    barBox.setAttribute('id', 'barBox')
    barBox.setAttribute('style', 'opacity:1;background-color: #7bed9f;z-index: 99; position: fixed; border-radius: 5px; border: none; width: 100%; height: 10px; left: 0px; top: 0px; display: flex; flex-flow: row nowrap; justify-content: start; align-items: center;')
    readerContainer.appendChild(barBox)

    for (var i = 0; i < pageElements.length; i++) {
        window.pageUrls.push(pageElements[i].href)
        var img = document.createElement('img')
        img.setAttribute('id', 'img' + i)
        img.setAttribute('name', 'anchor' + i)
        img.setAttribute('order', i)
        img.setAttribute('style', 'width:100%')
        img.onload = imgLoadSuccess
        img.onerror = imgLoadFailed
        readerContainer.append(img)
        window.imgElements[i] = img
        var bar = document.createElement('a')
        bar.setAttribute('href', '#anchor' + i)
        bar.setAttribute('style', 'opacity:1;z-index: 100;display: flex; flex-grow: 1; background-color: #ff6b81;height: 100%;')
        barBox.appendChild(bar)
        window.progressBars[i] = bar
    }
    container.parentElement.removeChild(container)
    window.initReader = true
    for (var i = 0; i < window.pageUrls.length; i++) {

        loadImg(imgFrame, i, true)
    }
}
function refresh() {
    console.log('refreshImgFrame')
    window.loaded = 0
    for (var i = 0; i < window.pageUrls.length; i++) {
        if (!window.imgElements[i].complete) {
            window.progressBars[i].style.backgroundColor = '#ffa502'
            if (!window.imgUrls[i]) {
                loadImg(i, false)
            } else {
                if (window.pageUrls[i].indexOf('?nl') < 0) {
                    window.pageUrls[i] += '?nl=' + window.nls[i]
                }
                var imgFrame = document.getElementById('imgFrame').contentWindow
                loadImg(imgFrame, i, false)
            }
        } else {
            window.loaded++
        }
    }
    if (window.loaded >= window.pageUrls.length) {
        hideElement(document.getElementById('barBox'))
    }
}
function back() {
    showMainFrame()
}
function toTop(){
    document.getElementById('imgFrame').contentWindow.document.documentElement.scrollTop = 0
    document.getElementById('imgFrame').contentWindow.document.body.scrollTop = 0
}
function toBottom(){
    document.getElementById('imgFrame').contentWindow.document.documentElement.scrollTop = document.getElementById('imgFrame').contentWindow.document.documentElement.scrollHeight
    document.getElementById('imgFrame').contentWindow.document.body.scrollTop = document.getElementById('imgFrame').contentWindow.document.body.scrollHeight
}
function exFrameLoaded() {
    window.myframe = document.getElementById('myframe').contentWindow
    var href = window.myframe.document.location.href
    console.log('onload')
    window.history.pushState(null, null, href)
    runReader()
}

window.onpopstate = function () {
    console.log('back')
    showMainFrame()
}

function aClick(event) {
    console.log('aclick')
    var e = window.event || event
    e.preventDefault()
    if (this.href.indexOf('https://exhentai.org/g/') >= 0) {
        if (document.getElementById('imgFrame').style.display == 'block') {
            $('#imgFrame').empty()
        }
        listenImgFrame()
        $('#imgFrame').attr('src', this.href)
        showImgFrame()
    } else {
        document.getElementById('mainFrame').contentWindow.document.body.innerHTML = ''
        listenMainFrame()
        $('#mainFrame').attr('src', this.href)
        showMainFrame()
    }

}
function showBar(){
    console.log('showbar')
    var bar = document.getElementById('topBar')
    bar.style.top = '0px'
}
function hideBar(){
    console.log('hidebar')
    var bar = document.getElementById('topBar')
    bar.style.top = '-200px'
}
function listenImgFrame(old) {
    console.log('listenImgFrame')
    var imgFrame = document.getElementById('imgFrame').contentWindow
    var href = imgFrame.document.location.href
    if (imgFrame.document.getElementById('gdt') && old != href) {
        // var as = imgFrame.document.body.getElementsByTagName('a')
        // for (var i = 0; i < as.length; i++) {
        //     as[i].onclick = aClick
        // }
        // window.history.pushState(null, null, document.location.href)
        imgFrame.document.documentElement.scrollTop = 0
        window.barTop = 0
        imgFrame.document.body.onscroll = function(){
            var y = imgFrame.document.documentElement.scrollTop
            console.log(y)
            if(y - window.barTop >20){
                window.barTop = y
                hideBar()
            }
            if(y-window.barTop < -150){
                window.barTop = y
                showBar()
            }
        }

        imgFrame.document.body.touchstart = function(){
            console.log('touchstart')
        }
        imgFrame.document.documentElement.touchstart = function(){
            console.log('touchstart2')
        }
        imgFrame.document.touchstart = function(){
            console.log('touchstart3')
        }

        $('#imgFrame').contents().find('td').each(function () {
            $(this).removeAttr('onclick')
        })
        $('#imgFrame').contents().find('a').each(function () {
            $(this).removeAttr('onclick')
            $(this).click(function (event) {
                var e = window.event || event
                e.preventDefault()
                e.stopPropagation()
                console.log(this.href)
                if (this.href.indexOf('https://exhentai.org/g/') >= 0) {
                    if (document.getElementById('imgFrame').style.display == 'block') {
                        document.getElementById('imgFrame').contentWindow.document.body.innerHTML = ''
                    }
                    listenImgFrame(href)
                    $('#imgFrame').attr('src', this.href)
                    showImgFrame()
                } else {
                    document.getElementById('mainFrame').contentWindow.document.body.innerHTML = ''
                    listenMainFrame(href)
                    $('#mainFrame').attr('src', this.href)
                    showMainFrame()
                }
            })
        })
        runReader(imgFrame)
    } else {
        requestAnimationFrame(function () {
            listenImgFrame(old)
        })
    }

}
function listenMainFrame(old) {
    console.log('listenMainFrame')
    var mainFrame = document.getElementById('mainFrame').contentWindow
    var href = mainFrame.document.location.href
    if (mainFrame.document.getElementsByClassName('gld')[0] && old != href) {
        $('#mainFrame').contents().find('a').each(function () {
            console.log($(this))
            $(this).removeAttr('onclick')
            if ($(this).attr('href').indexOf('https://exhentai.org/g/') >= 0) {
                $(this).click(function (event) {
                    var e = window.event || event
                    e.preventDefault()
                    e.stopPropagation()
                    console.log(this.href)
                    if (document.getElementById('imgFrame').style.display != 'none') {
                        document.getElementById('imgFrame').contentWindow.document.body.innerHTML = ''
                    }
                    listenImgFrame('a')
                    $('#imgFrame').attr('src', this.href)
                    showImgFrame()
                })
            }

        })
        $('#mainFrame').contents().find('td').each(function () {
            console.log($(this))
            var a = $(this).find('a:eq(0)')
            if (a.length > 0) {
                if (a.attr('href').indexOf('?page=') >= 0 || $(this).find('a:eq(0)').text() == 1) {
                    $(this).removeAttr('onclick')
                    $(this).click(function (event) {
                        var e = window.event || event
                        e.preventDefault()
                        e.stopPropagation()
                        document.getElementById('mainFrame').contentWindow.document.body.innerHTML = ''
                        listenMainFrame(href)
                        $('#mainFrame').attr('src', a.attr('href'))
                        showMainFrame()
                    })
                }
            }

        })
        // } else {
        //     document.getElementById('mainFrame').contentWindow.document.body.innerHTML = ''
        //     listenMainFrame(href)
        //     $('#mainFrame').attr('src', this.href)
        //     showMainFrame()
        // }

    } else {
        requestAnimationFrame(function () {
            listenMainFrame(old)
        })
    }
}

var j = document.createElement('script')
j.setAttribute('src', 'https://cdn.staticfile.org/jquery/3.4.1/jquery.js')
j.setAttribute('id', 'jquery')
j.setAttribute('onload', 'loadReader()')
document.head.appendChild(j)

function loadReader() {
    if (!inExhentai()) {
        if (confirm('需要先打开exhentai主页再运行脚本，是否打开exhentai主页？')) {
            document.location.href = "https://exhentai.org/"
        }
    } else {

        document.body.innerHTML = ""
        var mystyle1 = document.createElement('style')
        mystyle1.innerText = 'html,body,iframe{height:100%;width:100%;}.ibox{background-color: rgba(50,50,50,0.8);display: flex; flex-grow: 1;font-size:30px;justify-content: center; align-items: center;height: 100%;}'
        document.head.appendChild(mystyle1)
        var mystyle2 = $('<link  rel="stylesheet" type="text/css" href="https://at.alicdn.com/t/font_1345377_p8vtkk60btq.css">')
        $('head').append(mystyle2)
        var mainFrame = document.createElement('iframe')
        mainFrame.setAttribute('id', 'mainFrame')
        mainFrame.setAttribute('frameborder', '0')
        mainFrame.setAttribute('src', document.location.href)
        document.body.appendChild(mainFrame)
        var imgFrame = document.createElement('iframe')
        imgFrame.setAttribute('id', 'imgFrame')
        imgFrame.setAttribute('frameborder', '0')
        imgFrame.setAttribute('style', 'display:none;')
        document.body.appendChild(imgFrame)
        var topBar = $('<div id="topBar" style="display: none; flex-flow: row nowrap;z-index:20;width:100%;height:140px;position:fixed;top:0px;"></div>')
        var refreshTool = $('<div onclick="refresh()" id="refreshTool" class="ibox"><i style="font-size:100px;" class="iconfont icon-refresh"></i></div>')
        var topTool = $('<div onclick="toTop()" id="topTool" class="ibox"><i style="font-size:100px;" class="iconfont icon-top"></i></div>')
        var bottomTool = $('<div onclick="toBottom()" id="bottomTool" class="ibox"><i style="font-size:100px;" class="iconfont icon-bottom"></i></div>')
        var backTool = $('<div onclick="back()" id="backTool" class="ibox"><i style="font-size:100px;" class="iconfont icon-Back"></i></div>')
        topBar.append(refreshTool)
        topBar.append(topTool)
        topBar.append(bottomTool)
        topBar.append(backTool)
        $('body').append(topBar)



        listenMainFrame('a')

    }
}



// javascript:var s = document.createElement('script'); s.setAttribute('step',20); s.setAttribute('src','https://manakanemu.oss-cn-beijing.aliyuncs.com/vscode/ExHentaiReader/reloadStructure.js?'+parseInt(Date.parse(new Date())/1000)); s.setAttribute('id','exReader'); document.body.appendChild(s);
