function GET(url, fn, type, sync = true) {
    if (type == 'jsonp') {
        var script = document.createElement('script')
        script.src = url
        script.onload = function () {
            var data = window.jsonpdata
            window.jsonpdata = null
            fn(data)
        }
        document.body.appendChild(script)
    } else {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', url, sync)
        xhr.onload = function () {
            var responseText = this.responseText
            if (type == 'json') {
                fn(JSON.parse(responseText))
            }
            if (type == 'html') {
                var container = document.createElement('div')
                container.innerHTML = responseText
                fn(container.childNodes)
            }
            if (type == 'text') {
                fn(responseText)
            }
        }
        xhr.send()
    }
}

function hideElement(element) {
    if (element.style.opacity > 0) {
        element.style.opacity -= 0.05
        requestAnimationFrame(function () {
            hideElement(element)
        })
    }
}

function barComplete(i) {
    hideElement(window.reader.progressBars[i].dom)
}

function imgLoadSuccess() {
    window.reader.loaded++
    var order = this.getAttribute('order')
    window.reader.image[order].complete = true
    barComplete(order)
    if (window.reader.loaded >= window.reader.page.length) {
        hideElement(document.getElementById('titleBar'))
    }
}

function imgLoadFailed() {
    this.setAttribute('src', this.src)
}

function loadImg(pageurl, i, first) {

    // 通过pageurl获取图片url，并绑定到对应图片标签上
    var color = document.getElementById('exReader').getAttribute('line-color') || 'yellow'
    var xhr = new XMLHttpRequest()
    xhr.open('GET', pageurl, true)
    xhr.onload = function () {
        if (this.status === 200) {
            var imgUrl = this.responseText.match(/<img id=\"img\" src=\"(.+?)\"/i)[1]
            var nl = this.responseText.match(/onclick=\"return nl\(\'(.+?)\'\)\"/i)[1]
            window.reader.image[i].url = imgUrl
            window.reader.image[i].nl = nl
            window.reader.image[i].complete = false
            var img = document.getElementById('img' + i)
            if (first) {
                var h = document.createElement('hr')
                h.setAttribute('style', 'width:100%;height:8px;background-color:' + color + ';margin:0px;')
                img.parentElement.insertBefore(h, img)
            }
            img.setAttribute('src', imgUrl)
        }
    }
    xhr.send()
}

function toTop() {
    window.scrollTo({
        top: window.reader.image[0].dom.offsetTop,
        behavior: "smooth"
    });
}

function toBottom() {
    window.scrollTo({
        top: window.reader.image[window.reader.size - 1].dom.offsetTop,
        behavior: "smooth"
    });

}

function changeResource() {
    // console.log('changeResource')
    window.reader.loaded = 0
    for (var i = 0; i < window.reader.page.length; i++) {
        if (!window.reader.image[i].complete) {
            window.reader.progressBars[i].dom.style.backgroundColor = '#ffa502'
            if (!window.reader.image[i].url) {
                loadImg(window.reader.page.url, i, false)
            } else {
                loadImg(window.reader.page[i].url + '?nl=' + window.reader.image[i].nl, i, false)
            }
        } else {
            window.reader.loaded++
        }
    }
    if (window.reader.loaded >= window.reader.page.length) {
        hideElement(document.getElementById('titleBar'))
    }
}

function recoverPosition() {
    var position = parseInt(document.cookie.match(/mrp=(.+?);/i)[1])
    if (position) {
        window.scrollTo({
            top: position,
            behavior: "smooth"
        });
    }
}
function originWebpage(){
    window.location.href = window.location.origin+window.location.pathname+ '?originalReader='+ parseInt(Date.parse(new Date()) / 1000)
}

function showToolBar() {
    document.getElementById('toolBar').style.transform = 'translateX(0)'
    window.reader.toolbar.show = true
    window.reader.touch = 0
}

function hidenToolBar() {
    document.getElementById('toolBar').style.transform = 'translateX(-100%)'
    window.reader.toolbar.show = false
}

function setPositionRecord(position) {
    var exp = new Date()
    exp.setTime(exp.getTime() + 20 * 24 * 60 * 60 * 1000)
    var cookie = 'mrp=' + position.toString() + ';path=' + window.location.pathname + ';expires=' + exp.toGMTString()
    document.cookie = cookie
}

function initReaderObject() {
    window.reader = {}
    window.reader.info = {}
    window.reader.setting = document.getElementById('exReader')
    window.reader.touch = 0
    window.reader.tag = {}
    window.reader.toolbar = {}
    window.reader.toolbar.show = false
    window.reader.scrollTop = window.pageYOffset
    window.reader.scrollDirection = -1
    window.reader.page = new Array()
    window.reader.image = new Array()
    window.reader.progressBars = new Array()
    window.reader.loaded = 0
}

function getConfig() {
    try {
        const title = document.getElementById('gn').innerText || ''
        const cover = document.getElementById('gd1').innerHTML.match(/url\((.*)\)/i)[1] || ''
        window.reader.info.title = title
        window.reader.info.cover = cover
    }catch (e) {

    }
    const scriptUrl = window.reader.setting.src.match(/(http.*?\/)Reader.js/)[1]
    console.log(window.reader.setting.sr)
    const isTranslate = window.reader.setting.getAttribute('translate') || "true"
    const isrebuild = window.reader.setting.getAttribute('rebuild') || "true"
    const isOpenBlank = window.reader.setting.getAttribute('openBlank') || 'false'

    const fontSize = eval(window.reader.setting.getAttribute('fontsize')) || 9
    const tagFontSize =  eval(window.reader.setting.getAttribute('tag-fontsize')) || 9

    window.reader.info.fontSize = fontSize
    window.reader.info.tagFontSize = tagFontSize
    window.reader.info.isTranslate = eval(isTranslate)
    window.reader.info.isRebuild = eval(isrebuild)
    window.reader.info.isOpenBlank = eval(isOpenBlank)
    window.reader.info.scriptUrl = scriptUrl

}

function initImageStructure() {
    //获取exhentai页面的容器
    var container = document.getElementById('gdt')
    var pageElements = container.getElementsByTagName('a')
    // 把自定义的reader容器嵌入页面
    var readerContainer = document.createElement('div')
    readerContainer.setAttribute('id', 'readerContainer')
    container.parentElement.insertBefore(readerContainer, container)
    var barBox = document.createElement('div')
    barBox.setAttribute('id', 'titleBar')
    barBox.setAttribute('style', 'opacity:1;background-color: #7bed9f;z-index: 99; position: fixed; border-radius: 5px; border: none; width: 100%; height: 10px; left: 0px; top: 0px; display: flex; flex-flow: row nowrap; justify-content: start; align-items: center;')
    readerContainer.appendChild(barBox)
    // 从exhentai原始容器中读取每个页面的url添加到pageUrl，并生成对应的自定义图像标签
    for (var i = 0; i < pageElements.length; i++) {
        window.reader.page[i] = {}
        window.reader.image[i] = {}
        window.reader.page[i].url = pageElements[i].href
        var img = document.createElement('img')
        img.setAttribute('id', 'img' + i)
        img.setAttribute('name', 'anchor' + i)
        img.setAttribute('order', i)
        img.setAttribute('style', 'width:100%')
        img.onload = imgLoadSuccess
        img.onerror = imgLoadFailed
        readerContainer.append(img)
        window.reader.image[i].dom = img
        var bar = document.createElement('a')
        bar.setAttribute('href', '#anchor' + i)
        bar.setAttribute('style', 'opacity:1;z-index: 100;display: flex; flex-grow: 1; background-color: #ff6b81;height: 100%;')
        barBox.appendChild(bar)
        window.reader.progressBars[i] = {}
        window.reader.progressBars[i].dom = bar
    }
    window.reader.size = window.reader.page.length
    // 删除原始容器
    container.parentElement.removeChild(container)
}


function initToolBarStructure() {
    const bar = document.createElement('div')
    bar.id = 'toolBar'
    bar.style.opacity = 1
    window.reader.info.toolbarSize  = document.getElementById('exReader').getAttribute('toolbar-size') || Math.round(Math.min(window.screen.availWidth, window.screen.availHeight) / 6) * window.devicePixelRatio
    bar.style.width = window.reader.info.toolbarSize.toString() + 'pt'
    const top = document.createElement('div')
    const bottom = document.createElement('div')
    const recover = document.createElement('div')
    const reload = document.createElement('div')
    const origin = document.createElement('div')
    const topIcon = document.createElement('i')
    const bottomIcon = document.createElement('i')
    const recoverIcon = document.createElement('i')
    const reloadIcon = document.createElement('i')
    const originIcon = document.createElement('i')
    topIcon.className = 'iconfont icon-up'
    topIcon.style.fontSize = Math.round(window.reader.info.toolbarSize * 0.6).toString() + 'pt'
    bottomIcon.className = 'iconfont icon-down'
    bottomIcon.style.fontSize = Math.round(window.reader.info.toolbarSize * 0.6).toString() + 'pt'
    recoverIcon.className = 'iconfont icon-huifu'
    recoverIcon.style.fontSize = Math.round(window.reader.info.toolbarSize * 0.6).toString() + 'pt'
    reloadIcon.className = 'iconfont icon-change'
    reloadIcon.style.fontSize = Math.round(window.reader.info.toolbarSize * 0.6).toString() + 'pt'
    originIcon.className = 'iconfont icon-original'
    originIcon.style.fontSize = Math.round(window.reader.info.toolbarSize * 0.6).toString() + 'pt'
    top.appendChild(topIcon)
    bottom.appendChild(bottomIcon)
    recover.appendChild(recoverIcon)
    reload.appendChild(reloadIcon)
    origin.appendChild(originIcon)
    bar.appendChild(top)
    bar.appendChild(bottom)
    bar.appendChild(recover)
    bar.appendChild(reload)
    bar.appendChild(origin)
    document.body.appendChild(bar)

    top.onclick = toTop
    bottom.onclick = toBottom
    reload.onclick = changeResource
    recover.onclick = recoverPosition
    origin.onclick = originWebpage
}

function initStyleLink() {
    var readerStyle = document.createElement('link');
    readerStyle.rel = 'stylesheet';
    readerStyle.type = 'text/css';
    readerStyle.href = window.reader.info.scriptUrl+'reader.css?' + parseInt(Date.parse(new Date()) / 1000);
    document.body.appendChild(readerStyle);
    const iconStyle1 = document.createElement('link');
    iconStyle1.rel = 'stylesheet';
    iconStyle1.type = 'text/css';
    iconStyle1.href = 'https://at.alicdn.com/t/font_1345377_wn98j672mcn.css';
    document.body.appendChild(iconStyle1);
    const iconStyle2 = document.createElement('link');
    iconStyle2.rel = 'stylesheet';
    iconStyle2.type = 'text/css';
    iconStyle2.href = '//at.alicdn.com/t/font_2044102_jyw69l1l0pj.css';
    document.body.appendChild(iconStyle2);
}

function reframeWebpage() {
    const boxSize = Math.floor(document.body.clientWidth / 11)
    const fontSize = Math.floor(boxSize * 0.7)

    const switchBox1 = document.getElementsByClassName('ptb')[0]
    switchBox1.style = 'width:100%;'
    const switchBar1 = switchBox1.getElementsByTagName('tr')[0]
    switchBar1.style = 'display: flex; flex-flow: row nowrap; justify-content: center;'
    const switchButton1 = switchBar1.getElementsByTagName('td')

    // const switchBox2 = document.getElementsByClassName('gtb')[0]
    // switchBox2.style = 'width:100%;'
    // const switchBar2 = switchBox2.getElementsByTagName('tr')[0]
    // switchBar2.style = 'display: flex; flex-flow: row nowrap; justify-content: center;'
    // const switchButton2 = switchBar2.getElementsByTagName('td')

    for (let i = 0; i < switchButton1.length; i++) {
        switchButton1[i].style = 'display: flex; height:' + fontSize.toString() + 'px;width:' + fontSize.toString() + 'px;justify-content: center;font-size:' + fontSize.toString() + 'px;'
        if (switchButton1[i].getElementsByTagName('a')[0]) {
            switchButton1[i].getElementsByTagName('a')[0].style = 'font-size:' + fontSize.toString() + 'px'
        }

        // switchButton2[i].style = 'display: flex; height:' + fontSize.toString() + 'px;width:' + fontSize.toString() + 'px;justify-content: center;font-size:' + fontSize.toString() + 'px;'
        // if (switchButton2[i].getElementsByTagName('a')[0]) {
        //     switchButton2[i].getElementsByTagName('a')[0].style = 'font-size:' + fontSize.toString() + 'px'
        // }
    }
}

function translateTag() {
    let tagBox = document.getElementsByClassName('gtl')
    for (var i = 0; i < tagBox.length; i++) {
        tagBox[i].classList.add('tag')
    }
    tagBox = document.getElementsByClassName('gtw')
    for (var i = 0; i < tagBox.length; i++) {
        tagBox[i].classList.add('tag')
    }
    tagBox = document.getElementsByClassName('gt')
    for (var i = 0; i < tagBox.length; i++) {
        tagBox[i].classList.add('tag')
    }
    tagBox = document.getElementsByClassName('tag')
    for (let tagc of tagBox) {
        const tag = tagc.getElementsByTagName('a')[0] ||  tagc
        tagc.setAttribute('selected', false)
        const tagName = tag.innerText
        tag.innerText = window.reader.tag.dic[tagName] || tagName
        tag.setAttribute('tagName', tagName)
        tag.setAttribute('translateName', tag.innerText)
        tagc.onclick = function () {
            if (event && event.target != event.currentTarget) {
                var tag = this.getElementsByTagName('a')[0]
                if (window.reader.tag.selected == this) {
                    tag.innerText = tag.getAttribute('translateName')
                    window.reader.tag.selected = null
                } else {
                    tag.innerHTML = tag.getAttribute('tagName')
                    if (window.reader.tag.selected) {
                        var otag = window.reader.tag.selected.getElementsByTagName('a')[0]
                        otag.innerText = otag.getAttribute('translateName')
                    }
                    window.reader.tag.selected = this
                }
            }
        }
    }
}

function rebuildTitleBar() {
    const titleBar = document.getElementsByClassName('gm')[0]
    const titleTopLeft = document.createElement('div')
    const titleTopRight = document.createElement('div')
    const titleBottom = document.createElement('div')
    const titleTop = document.createElement('div')

    const cover = document.createElement('img')
    const title = document.getElementById('gn')
    const subTitle = document.getElementById('gj')
    const artInfo = document.getElementById('gd3')
    const tag = document.getElementById('gd4')
    const verticalLine = document.createElement('div')
    const horizontalLine = document.createElement('div')
    const tagAction = document.getElementById('tagmenu_act')
    const tagNew = document.getElementById('tagmenu_new')

    titleTopLeft.appendChild(cover)
    titleTopRight.appendChild(title)
    titleTopRight.appendChild(subTitle)
    titleTopRight.appendChild(artInfo)
    titleBottom.appendChild(tag)
    titleTop.appendChild(titleTopLeft)
    titleTop.appendChild(verticalLine)
    titleTop.appendChild(titleTopRight)

    titleBar.innerHTML = ''
    titleBar.appendChild(titleTop)
    titleBar.appendChild(horizontalLine)
    titleBar.appendChild(titleBottom)


    titleTopLeft.className = 'reader-title-top-left'
    titleTopRight.className = 'reader-title-top-right'
    titleBottom.className = 'reader-title-bottom'
    titleTop.className = 'reader-title-top'
    verticalLine.id = 'reader-title-top-verticalline'


    titleBar.style = 'max-width:100%;width:100%;display:flex;flex-flow: column nowrap;justify-content: start;align-items: center;overflow: hidden;'
    titleTop.style = 'width:100%;display: flex;flex-flow: row nowrap;justify-content: start;align-items: center;'
    titleBottom.style = 'width:100%;'
    titleTopLeft.style = "display: flex;flex-flow: column nowrap;justify-content: start;align-items: center;position: relative;width:38%;padding:2%;"
    titleTopRight.style = 'padding:10px 0px 10px 0px;width:56%;'
    verticalLine.style='margin:0px 2% 0px 0px;width:2px;background-color:black;'
    verticalLine.style.height = titleTop.offsetHeight*0.9.toString()+'px'
    horizontalLine.style='width:98%;height:1px;background-color:black;border:0px;'
    tag.style='width:100%;border:0px;margin:5px 0px 5px 0px;'
    tagAction.style='width:100%;height:auto;margin:10px 0px 0px 0px;'
    tagAction.style.fontSize = window.reader.info.fontSize.toString()+'pt'
    tagNew.style = 'width:100%;'

    for(let i = 0;i < tagNew.getElementsByTagName('input').length;i++){
        tagNew.getElementsByTagName('input')[i].style.fontSize
    }


    cover.onload = function(){
        document.getElementById('reader-title-top-verticalline').style.height = document.getElementById('reader-title-top-verticalline').parentNode.offsetHeight*0.9.toString()+'px'
    }
    cover.src = window.reader.info.cover
    cover.style = 'width:100%;'
    for (let i =0;i<artInfo.childNodes.length;i++) {
        artInfo.childNodes[i].style.fontSize = window.reader.info.fontSize.toString() + 'pt'
    }


    const infoClass = artInfo.childNodes[0]
    infoClass.appendChild(artInfo.childNodes[1].childNodes[0])

    infoClass.style.display='flex'
    infoClass.style.flexFlow='row nowrap'
    infoClass.childNodes[0].style.height='auto'
    infoClass.childNodes[0].style.width='auto'
    infoClass.childNodes[0].style.padding='10px 20px 10px 20px'
    infoClass.childNodes[0].style.margin='0px 10% 0px 0px'
    infoClass.childNodes[0].style.fontSize = window.reader.info.fontSize.toString() + 'pt'
    artInfo.childNodes[3].getElementsByTagName('tr')[1].childNodes[0].style = 'padding:0px;text-align:left;'
    artInfo.childNodes[4].style.paddingLeft = '0px'
    document.getElementById('favoritelink').style.whiteSpace='nowrap'

    title.onclick = function () {
        this.style.whiteSpace = 'normal'
        document.getElementById('reader-title-top-verticalline').style.height = document.getElementById('reader-title-top-verticalline').parentNode.offsetHeight*0.9.toString()+'px'

    }
    subTitle.onclick = function () {
        this.style.whiteSpace = 'normal'
        document.getElementById('reader-title-top-verticalline').style.height = document.getElementById('reader-title-top-verticalline').parentNode.offsetHeight*0.9.toString()+'px'

    }

}

function setStyle() {
    let style = document.createElement('style')
    style.innerHTML = '.gtw,.gt,.gtl,.gt,.tag{font-size: ' + window.reader.info.tagFontSize.toString() + 'pt;}'
    if(window.reader.info.isRebuild){
        style.innerHTML += '.tc{font-size: ' + window.reader.info.tagFontSize.toString() + 'pt;}'
        style.innerHTML += 'h1#gn,h1#gj{font-size: ' + window.reader.info.fontSize.toString() + 'pt;}'
        style.innerHTML += '#gn,#gj{text-overflow: ellipsis;white-space: nowrap;overflow: hidden;cursor:pointer;}'
        style.innerHTML += 'input#newtagfield,input#newtagbutton{font-size:'+window.reader.info.fontSize.toString()+'pt;line-height:normal;}'
        style.innerHTML += 'input#newtagfield{width:70%;}'
        style.innerHTML += 'input#newtagbutton{width:auto;}'
    }

    document.head.appendChild(style)

}

const version = 1.3
const currentTagDicVersion = 1.3
var isOrigin = window.location.href.indexOf('originalReader=')
if(isOrigin > -1){
    const href = window.location.href.split('&')
    const orginTimestamp = parseInt(href[0].split('=')[1])
    if(parseInt(Date.parse(new Date()) / 1000)-orginTimestamp > 5){
        isOrigin = false
    }else {
        isOrigin = true
    }
}else {
    isOrigin = false
}
if(!isOrigin){
    initReaderObject()
    getConfig()
    setStyle()

    if(/(ex|e-)hentai.org\/(tag|\?)/.test(document.location.href)){
        if(window.reader.info.isOpenBlank){
            const links = document.getElementsByTagName('a')
            for(let a of links){
                if(/(ex|e-)hentai.org\/g\//.test(a.href)){
                    a.target = '_blank'
                }
            }
        }
    }

    if (window.reader.info.isTranslate) {
        window.reader.tag.dic = localStorage.getItem('tagDic')
        window.reader.tag.dic = JSON.parse(window.reader.tag.dic)

        if (window.reader.tag.dic && 'TAGDICVERSION' in window.reader.tag.dic && Number(window.reader.tag.dic['TAGDICVERSION']) >= currentTagDicVersion) {
            // window.reader.tag.dic = JSON.parse(window.reader.tag.dic)
            translateTag()
        } else {
            GET(window.reader.info.scriptUrl+'tag.json.js?' + parseInt(Date.parse(new Date()) / 1000),
                function (data) {
                    window.reader.tag.dic = data
                    localStorage.setItem('tagDic', JSON.stringify(window.reader.tag.dic))
                    translateTag()
                }, 'jsonp')
        }
    }

    if (document.location.href.indexOf('//exhentai.org/g/') > -1 || document.location.href.indexOf('//e-hentai.org/g/') > -1) {
        if(window.reader.info.isRebuild){
            rebuildTitleBar()
        }


        document.body.scrollTop = 0
        document.documentElement.scrollTop = 0
        initStyleLink()
        initImageStructure()
        initToolBarStructure()
        reframeWebpage()
        for (var i = 0; i < window.reader.page.length; i++) {
            loadImg(window.reader.page[i].url, i, true)
        }

    }

    window.onscroll = function () {
        var currentScroll = window.pageYOffset
        var direction = currentScroll - window.reader.scrollTop
        if (direction > 0) {
            if (window.reader.toolbar.show) {
                this.hidenToolBar()
            }
        } else {
            if ((!window.reader.toolbar.show) && (window.reader.touch > 0) && (window.reader.touch - currentScroll) > 50)
                this.showToolBar()
        }
        window.reader.scrollTop = currentScroll
    }
    window.onbeforeunload = function () {
        window.setPositionRecord(window.pageYOffset)
    }
    window.onunload = function () {
        window.setPositionRecord(window.pageYOffset)
    }
    window.onblur = function () {
        window.setPositionRecord(window.pageYOffset)
    }
    window.ontouchstart = function () {
        window.reader.touch = 0
    }
    window.ontouchend = function () {
        window.reader.touch = window.pageYOffset
    }

}



