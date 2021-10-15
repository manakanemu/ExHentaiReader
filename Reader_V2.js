function print(...e){
    console.log('@exReader:',...e)
}
function getOffsetTopByBody(el) {
    let offsetTop = 0
    while (el && el.tagname !== 'BODY') {
        offsetTop += el.offsetTop
        el = el.offsetParent
    }
    return offsetTop
}
print('run manakanemu exhentaireader')
function GET(url, fn, type, async = true) {
    // Ajax GET 请求封装，回调函数fn使用GET上下文，如果需要指定回调函数上下文，请指定GET上下文：GET.call(this,params...)
    print('GET: ' + url)
    if (type == 'jsonp') {
        var script = document.createElement('script')
        script.src = url
        script.onload = function () {
            var data = window.jsonpdata
            window.jsonpdata = null
            fn.call(this, data)
        }
        document.body.appendChild(script)
    } else {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', url, async)
        xhr.onload = () => {
            if (xhr.status === 200) {
                let responseText = xhr.responseText
                let parm = responseText
                if (type == 'json') {
                    parm = JSON.parse(responseText)
                }
                if (type == 'html') {
                    var container = document.createElement('div')
                    container.innerHTML = responseText
                    parm = container
                }
                if (type == 'text') {
                    parm = responseText
                }
                fn.call(this, parm)
            }
        }
        xhr.send()
    }
}

//脚本版本和字典版本，脚本版本可用于更新通知（未实现），字典版本可以用于控制本地字典更新
var VERSION = 1.3
var CURRENT_TAG_DICT_VERSION = 1.3

//判断是否使用原汁原味网页，如果isLoadOrigin为true，则后续逻辑不会执行
var isLoadOrigin = (window.location.href.indexOf('originalReader=') > -1)
if (isLoadOrigin) {
    const href = window.location.href.split('&')
    const orginTimestamp = parseInt(href[0].split('=')[1])
    if (parseInt(Date.parse(new Date()) / 1000) - orginTimestamp > 5) {
        isLoadOrigin = false
    } else {
        isLoadOrigin = true
    }
}


class GalleryInformation {
    constructor() {
        const title = !!document.getElementById('gn') ? document.getElementById('gn').innerText : ''
        const cover = !!document.getElementById('gd1') ? document.getElementById('gd1').innerHTML.match(/url\((.*)\)/i)[1] : ''
        const infoDOMS = !!document.getElementById('gdd') ? document.getElementById('gdd').getElementsByTagName('tr') : []
        const imgPerPage = document.getElementsByClassName('gdtm').length || document.getElementsByClassName('reader-img').length
        const galleryUrl = window.location.protocol + '//' + window.location.host + window.location.pathname
        const metaInfo = {}
        for (let meta of infoDOMS) {
            const key = !!meta.children[0] ? meta.children[0].innerText.toLowerCase().replace(' ', '').replace(':', '') : ''
            const value = !!meta.children[1] ? meta.children[1].innerText : ''
            metaInfo[key] = value
        }
        const pageButtons = !!document.getElementsByClassName('gtb')[0] ? document.getElementsByClassName('gtb')[0].getElementsByTagName('a') : []
        let pages = 1
        for (let page of pageButtons) {
            const pageNum = Number(page.innerText)
            pages = pageNum || pages
        }

        this.title = title
        this.cover = cover
        this.detail = metaInfo
        this.pageNum = pages
        this.url = galleryUrl
        this.imgPerPage = imgPerPage
    }
}

class ImageMeta {
    constructor(page,index, url = '', pageUrl = '', width = 100, height = 139) {
        this._url = url
        this.nl = ''
        this._imagePageUrl = pageUrl
        this.width = width
        this.height = height
        this.galleryPage = page
        // 0：初始化 1：正在获取图片页url 2：已获得图片页url 3：正在获取图片url 4：已获取图片url 5：第一次加载img 6：第二次加载img -1：图片加载完成
        this._state = 0
        this.stateProxy = null
        this.index = index
        this.imageWidget = null
    }
    get url(){
        return this._url
    }
    set url(value){
        this._url = value
        if(value.indexOf('http') > -1){
            this.state = 4
        }
    }
    get imagePageUrl(){
        return this._imagePageUrl
    }
    set imagePageUrl(value){
        this._imagePageUrl = value
        if(value.indexOf('hentai.org/s/') > -1){
            this.state = 2
        }
    }
    get state(){
        return this._state
    }
    set state(value){
        if(value === this._state){
            return
        }
        if(value === -1 || (value > this._state && this._state > -1)){
            this._state = value
            if(!!this.stateProxy){
                this.stateProxy.call(this,value)
            }
        }
    }
    isGetPage() {
        return !!this.imagePageUrl
    }

    isGetUrl() {
        return !!this.url
    }
    loadIntoWidget(){
        if(this.state > 3){
            this.imageWidget.updateImageDOM()
        }else{
            if(this.state > 1){
                this.callImageUrl()
            }
            else{
                this.callPageUrl()
            }
        }
    }
    callPageUrl(){
        this.state = 1
        this.galleryPage.callPageUrl(this.imageWidget)
    }
    callImageUrl(){
        this.state = 3
        GET.call(this, this.imagePageUrl, function (d) {
            var imgUrl = d.match(/<img id=\"img\" src=\"(.+?)\"/i)[1]
            var nl = d.match(/onclick=\"return nl\(\'(.+?)\'\)\"/i)[1]
            this.url = imgUrl
            this.nl = nl
            this.imageWidget.updateImageDOM()
        }, 'text')
    }


    get isLoaded() {
        return !!this.url
    }
    get isShow(){

    }
}

class GalleryPage {
    constructor(index, size, pageUrl, timeout = 5000) {
        const images = []
        for (let i = 0; i < size; i++) {
            images.push(new ImageMeta(this,index*size+i))
        }
        this.index = index
        this.images = images
        this.url = pageUrl
        // 触发url解析函数的状态。0：未请求过；1：请求中；2：请求完成。
        this.callState = 0
        // 被动触发url解析的请求栈，存放触发imgparse，在请求完成后回调imgparse的call函数
        this.callStack = new Array()
        this.callTimestamp = new Date().getTime()
        this.isLoaded = false
        this.timeout = timeout
    }

    getImagePageFromeDom(dom) {
        const imageWidgets = dom.getElementsByClassName('gdtm')
        for (let i = 0; i < imageWidgets.length; i++) {
            const imageWidget = imageWidgets[i]
            const pageUrl = imageWidget.getElementsByTagName('a')[0].href
            const img = imageWidget.getElementsByTagName('img')[0]
            const height = Number(img.style.height.match(/\d*/)) || 139
            const width = Number(img.style.width.match(/\d*/)) || 100

            this.images[i].imagePageUrl = pageUrl
            this.images[i].height = height
            this.images[i].width = width

        }
        this.isLoaded = true
        print('get image page from dom finish: page', this.index, this)
    }
    clearCallStack(){
        for(let imgWidget of this.callStack){
            imgWidget.updateArea()
            imgWidget.imgInfo.callImageUrl()
        }
    }
    callPageUrl(imageWidget){
        if(this.callState > 1){
            imageWidget.imgInfo.callImageUrl()
            return
        }
        if(this.callState == 1){
            this.callStack.push(imageWidget)
            return
        }

        this.callState = 1
        this.callTimestamp = new Date().getTime()
        this.callStack.push(imageWidget)

        const url = this.url
        GET.call(this, url, function (d) {
            const imageWidgets = d.getElementsByClassName('gdtm')
            for (let i = 0; i < imageWidgets.length; i++) {
                const imageWidget = imageWidgets[i]
                const pageUrl = imageWidget.getElementsByTagName('a')[0].href
                const img = imageWidget.getElementsByTagName('img')[0]
                const height = Number(img.style.height.match(/\d*/)) || 139
                const width = Number(img.style.width.match(/\d*/)) || 100

                this.images[i].imagePageUrl = pageUrl
                this.images[i].height = height
                this.images[i].width = width

            }
            this.isLoaded = true
            this.clearCallStack()
        }, 'html')

    }
}

class ImageParser {
    constructor(information) {

        const imageNum = Number(information.detail.length.match(/\d*/)[0])
        const pageNum = information.pageNum

        let galleryPages = []
        for (let i = 0; i < pageNum; i++) {
            const pageUrl = information.url + '?p=' + i.toString()
            galleryPages.push(new GalleryPage(i, information.imgPerPage, pageUrl))
        }

        this.imageNum = imageNum
        this.imgPerPage = information.imgPerPage
        this.galleryPages = galleryPages
        this.galleryPages[0].getImagePageFromeDom(document.body)
    }

}


class Config {
    constructor(scriptDOM) {
        print('reading config ...')

        const scriptUrl = scriptDOM.getAttribute('src')
        const isTranslate = scriptDOM.getAttribute('translate') || 'true'
        const isrebuild = scriptDOM.getAttribute('rebuild') || 'true'
        const isOpenBlank = scriptDOM.getAttribute('openBlank') || 'true'

        const fontSize = eval(scriptDOM.getAttribute('fontsize')) || 9
        const tagFontSize = eval(scriptDOM.getAttribute('tag-fontsize')) || 9
        const lazyLoadingSize = eval(scriptDOM.getAttribute('lazy-loadingsize')) || 5

        this.fontSize = fontSize
        this.tagFontSize = tagFontSize
        this.lazyLoadingSize = lazyLoadingSize
        this.isTranslate = isTranslate == 'true' ? true : false
        this.isMobileRebuild = isrebuild == 'true' ? true : false
        this.isOpenBlank = isOpenBlank == 'true' ? true : false
        this.scriptUrl = !!scriptUrl ? scriptUrl.match(/(http.*?\/)Reader.*\.js/)[1] : 'http://localhost:63342/ExHentaiReader'
        print('@exReader:', this)
    }
}

class ImageWidget {
    constructor(webStructure,pageInfo,imgInfo, index, parent, containerWidth) {
        if(index !== imgInfo.index){
            throw new Error(`ImageWidget index:${index} do not match ImageMeta index:${imgInfo.index} `)
        }
        const blankImageUrl = '//exhentai.org/img/blank.gif'
        const width = containerWidth
        imgInfo.containerWidth = containerWidth
        imgInfo.imageWidget = this
        const height = width / imgInfo.width * imgInfo.height
        const img = document.createElement('img')
        img.setAttribute('id', 'img' + index)
        img.setAttribute('name', 'anchor' + index)
        img.setAttribute('order', index)
        img.setAttribute('style', `display:none;width:${width}px;height:${height}px;`)
        img.setAttribute('class', 'reader-img')
        img.setAttribute('src', blankImageUrl)

        img.onerror = () =>{
            this.state ++
            if(this.state == 6){
                this.imgInfo.imagePageUrl += '?nl=' + this.imgInfo.nl
                this.imgInfo.url = ''
                this.imgInfo.nl = ''
            }
            if(this.state < 7){
                return
            }

            print(`Image load fails. Reloading state: [${this.state}]`)
            this.imgInfo.loadIntoWidget()
        }
        img.onload = () => {
            if(this.img.src.indexOf(this.blankImageUrl) < 0){
                this.state = -1
                this.imgInfo.width = this.img.naturalWidth
                this.imgInfo.height = this.img.naturalHeight
                this.updateArea()
            }
        }
        imgInfo.stateProxy = (value) => {
            console.log(`stateProxy: index:${this.index} state:${this.state}`)
        }

        parent.appendChild(img)

        this.imgInfo = imgInfo
        this.webStructure = webStructure
        this.pageInfo = pageInfo
        this.img = img
        this.containerWidth = containerWidth
        this.blankImageUrl = blankImageUrl
        this.pos = getOffsetTopByBody(this.img) || -1


    }
    get state(){
        return this.imgInfo.state
    }
    set state(value){
        this.imgInfo.state = value
    }
    get index(){
        return this.imgInfo.index
    }
    get isLoaded() {
        return this.state === -1
    }
    get isLoading(){
        return this.state == 5 || this.state == 6
    }
    get isLoadStart(){
        return this.isLoading  || this.isLoaded
    }
    get index(){
        return this.imgInfo.index
    }
    get isLoaded() {
        return this.state === -1
    }
    get isLoading(){
        return this.state == 5 || this.state == 6
    }
    get isLoadStart(){
        return this.isLoading  || this.isLoaded
    }
    updateImageDOM(){
        if(this.img.src !== this.imgInfo.url){
            this.state ++
            this.img.src = this.imgInfo.url
            this.blankImageUrl
        }
    }
    callPosRefresh(){
        this.webStructure.updatePosAfter(this.index)
    }
    updateArea(){
        const display = this.img.style.display
        this.img.style.display = 'none'
        const containerWidth = this.imgInfo.containerWidth
        const width = containerWidth
        const height = containerWidth / this.imgInfo.width * this.imgInfo.height
        this.img.style.height = `${height}px`
        this.img.style.width = `${width}px`
        this.img.style.display = display
        this.callPosRefresh()
    }
    updatePos(){
        const pos = getOffsetTopByBody(this.img)
        this.pos = pos || -1
    }

    show() {
            this.img.style.display = 'block'
            this.updatePos()
            this.imgInfo.loadIntoWidget()
    }

    hide() {
        this.img.style.display = 'none'
    }
}

class WebStructure {
    constructor(config) {
        this.config = config
        this.loadQueue = []
        if (config.isMobileRebuild) {
            this.mobileRebuild(config)
        }
    }

    get isGallery() {
        return /\/exhentai\.org\/g\//.test(window.location.href)
    }
    get isWaitingForLoad(){
        return this.loadQueue.length > 0
    }
    forceRefresh(){
        for(let imageWidget of this.imageWidgets){
            if(!imageWidget.isLoaded){
                imageWidget.img.src = imageWidget.img.src
            }
        }
    }
    initImageStructure(imageParser) {
        print('initImageStructure')
        const imageNum = imageParser.imageNum
        //获取exhentai页面的容器
        const container = document.getElementById('gdt')
        const tmpReaderContainer = document.createElement('div')
        tmpReaderContainer.setAttribute('id', 'gdt')
        tmpReaderContainer.style.padding = '0px'
        container.parentElement.insertBefore(tmpReaderContainer, container)
        const containerWidth = tmpReaderContainer.clientWidth
        container.parentElement.removeChild(tmpReaderContainer)

        const readerContainer = document.createElement('div')
        readerContainer.setAttribute('id', 'gdt')
        readerContainer.style.padding = '0px'
        this.container = readerContainer

        // 从exhentai原始容器中读取每个页面的url添加到pageUrl，并生成对应的自定义图像标签
        const imageWidgets = []
        const loadQueue = []
        for (let i = 0; i < imageNum; i++) {
            const numOfPage = Math.floor(i / imageParser.imgPerPage)
            const index = i % imageParser.imgPerPage
            const imgwidget = new ImageWidget(this,imageParser.galleryPages[numOfPage],imageParser.galleryPages[numOfPage].images[index], i, readerContainer, containerWidth)
            imageWidgets.push(imgwidget)
            loadQueue.push([i,imgwidget])
        }
        this.imageWidgets = imageWidgets
        this.loadQueue = loadQueue
        container.parentElement.insertBefore(readerContainer, container)
        container.parentElement.removeChild(container)
    }
    updatePosAfter(index){
        for(let i = index;i<this.imageWidgets.length;i++){
            if(this.imageWidgets[i].img.style.display == 'none'){
                return
            }
            this.imageWidgets[i].updatePos()
        }


    }
    showImage(index){
        if(index < this.imageWidgets.length){
            this.imageWidgets[index].show()
        }else {
            print('@exReader')
        }
    }
    loadStyleFile() {
        var readerStyle = document.createElement('link');
        readerStyle.rel = 'stylesheet';
        readerStyle.type = 'text/css';
        readerStyle.href = window.reader.info.scriptUrl + 'reader.css?' + parseInt(Date.parse(new Date()) / 1000);
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

    mobileRebuild(config) {
        print('mobileRebuild')
        let style = document.createElement('style')
        let styleText = ''
        styleText = '.gtw,.gt,.gtl,.gt,.tag{font-size: ' + config.tagFontSize.toString() + 'pt;}'
        styleText += '.tc{font-size: ' + config.tagFontSize.toString() + 'pt;}'
        styleText += 'h1#gn,h1#gj{font-size: ' + config.fontSize.toString() + 'pt;}'
        styleText += '#gn,#gj{text-overflow: ellipsis;white-space: nowrap;overflow: hidden;cursor:pointer;}'
        styleText += 'input#newtagfield,input#newtagbutton{font-size:' + config.fontSize.toString() + 'pt;line-height:normal;}'
        styleText += 'input#newtagfield{width:70%;}'
        styleText += 'input#newtagbutton{width:auto;}'
        style.innerHTML = styleText
        document.head.appendChild(style)
    }
    getLoadStates(){
        const states = []
        for(let imageWidget of this.imageWidgets){
            states.push(imageWidget.isLoaded)
        }
        return states
    }
    translate() {
        window.selectedTag = null
        function translateTag(tagDict) {
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
                const tag = tagc.getElementsByTagName('a')[0] || tagc
                tagc.setAttribute('selected', false)
                const tagName = tag.innerText
                tag.innerText = tagDict[tagName] || tagName
                tag.setAttribute('tagName', tagName)
                tag.setAttribute('translateName', tag.innerText)
                tagc.onclick = function (event) {
                    if (event && event.target != event.currentTarget) {
                        var tag = this.getElementsByTagName('a')[0]
                        if (window.selectedTag == this) {
                            tag.innerText = tag.getAttribute('translateName')
                            window.selectedTag = null
                        } else {
                            tag.innerHTML = tag.getAttribute('tagName')
                            if (window.selectedTag) {
                                var otag = window.selectedTag.getElementsByTagName('a')[0]
                                otag.innerText = otag.getAttribute('translateName')
                            }
                            window.selectedTag = this
                        }
                    }
                }
            }
        }

        let tagDict = localStorage.getItem('tagDic')
        tagDict = JSON.parse(tagDict)

        if (tagDict && 'TAGDICVERSION' in tagDict && Number(tagDict['TAGDICVERSION']) >= CURRENT_TAG_DICT_VERSION) {
            translateTag(tagDict)
        } else {
            GET.call(this, this.config.scriptUrl + 'tag.json.js?' + parseInt(Date.parse(new Date()) / 1000),
                function (data) {
                    let tagDict = data
                    localStorage.setItem('tagDic', JSON.stringify(tagDict))
                    translateTag(tagDict)
                }, 'jsonp')
        }
    }

    blankHyperlink() {
        const links = document.getElementsByTagName('a')
        if (links.length < 1) {
            requestAnimationFrame(this.blankHyperlink)
        } else {
            let sum = 0
            for (let a of links) {
                if (/(ex|e-)hentai.org\/g\//.test(a.href)) {
                    sum++
                    a.target = '_blank'
                }
            }
            if (!sum) {
                requestAnimationFrame(this.blankHyperlink)
            } else {
                print('blank hyperlink')
            }
        }
    }
}

class ActionListener {
    constructor(config,webStructure) {
        this.lazyLoadingSize = config.lazyLoadingSize
        this.webStructure = webStructure
    }
    listenTouch(){

    }
    listenScroll(){
        const seenCurrentImageWidget = this.getFocus()
        const targetWidget = seenCurrentImageWidget + this.lazyLoadingSize
        if(this.webStructure.loadQueue.length > 0 && this.webStructure.loadQueue[0][0] <= targetWidget){
            this.lazyLoad(targetWidget)
        }
        requestAnimationFrame(this.listenScroll.bind(this))
    }

    lazyLoad(targetWidget){
        if(!window.count){
            window.count = 1
        }else {
            window.count ++
        }
        while(this.webStructure.loadQueue.length > 0 && this.webStructure.loadQueue[0][0] <= targetWidget){
            const [index,widget] = this.webStructure.loadQueue.shift()
            widget.show()
        }
    }
    getFocus(){
        const currentTop = document.documentElement.scrollTop
        const currentBottom = currentTop + document.documentElement.clientHeight
        let index = -1
        for(let imageWidget of this.webStructure.imageWidgets){
            if(imageWidget.pos < currentBottom && imageWidget.isLoadStart) {
                index += 1
            }else{
                break;
            }
        }
        return index
    }
}

if (!isLoadOrigin) {
    var config = new Config(document.getElementById('exReader'))
    var webStructure = new WebStructure(config)

    if (config.isOpenBlank && /(ex|e-)hentai.org\/($|tag|\?)/.test(document.location.href)) {
        webStructure.blankHyperlink()
    }
    if (config.isTranslate) {
        webStructure.translate()
    }

    if (webStructure.isGallery) {
        var galleryInformation = new GalleryInformation()
        var imageParser = new ImageParser(galleryInformation)
        webStructure.initImageStructure(imageParser)
        var actionListener = new ActionListener(config,webStructure)
        actionListener.listenScroll()

    }


}