function print(...e) {
    console.log("@exReader:", ...e)
}

function getOffsetTopByBody(el) {
    let offsetTop = 0;
    while (el && el.tagname !== "BODY") {
        offsetTop += el.offsetTop;
        el = el.offsetParent
    }
    return offsetTop
}

function scrollBack(ele, backPix) {
    if (ele.scrollHeight - ele.scrollTop === ele.clientHeight) {
        ele.scrollTop -= backPix
    }
}

function GET(url, fn, type, async = true) {
    print("GET: " + url);
    if (type == "jsonp") {
        var script = document.createElement("script");
        script.src = url;
        script.onload = function () {
            var data = window.jsonpdata;
            window.jsonpdata = null;
            fn.call(this, data)
        };
        document.body.appendChild(script)
    } else {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, async);
        xhr.onload = () => {
            if (xhr.status === 200) {
                let responseText = xhr.responseText;
                let parm = responseText;
                if (type == "json") {
                    parm = JSON.parse(responseText)
                }
                if (type == "html") {
                    var container = document.createElement("div");
                    container.innerHTML = responseText;
                    parm = container
                }
                if (type == "text") {
                    parm = responseText
                }
                fn.call(this, parm)
            }
        };
        xhr.send()
    }
}

function lockScroll(ele) {
    document.body.classList.add("fixed")
}

function unlockScroll(ele) {
    document.body.classList.remove("fixed")
}

class GalleryInformation {
    constructor() {
        if (!this.isGallery) {
            return
        }
        const title = !!document.getElementById("gn") ? document.getElementById("gn").innerText : "";
        const cover = !!document.getElementById("gd1") ? document.getElementById("gd1").innerHTML.match(/url\((.*)\)/i)[1] : "";
        const infoDOMS = !!document.getElementById("gdd") ? document.getElementById("gdd").getElementsByTagName("tr") : [];
        const imgPerPage = document.getElementsByClassName("gpc")[0] && document.getElementsByClassName("gpc")[0].innerText.match(/(\d*?) - (\d*?) of/) ? Number(document.getElementsByClassName("gpc")[0].innerText.match(/(\d*?) - (\d*?) of/)[2]) : document.getElementsByClassName("gdtm").length || document.getElementsByClassName("reader-img").length;
        const galleryUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        const metaInfo = {};
        for (let meta of infoDOMS) {
            const key = !!meta.children[0] ? meta.children[0].innerText.toLowerCase().replace(" ", "").replace(":", "") : "";
            const value = !!meta.children[1] ? meta.children[1].innerText : "";
            metaInfo[key] = value
        }
        const pageButtons = !!document.getElementsByClassName("gtb")[0] ? document.getElementsByClassName("gtb")[0].getElementsByTagName("a") : [];
        let pages = 1;
        for (let page of pageButtons) {
            const pageNum = Number(page.innerText);
            pages = pageNum || pages
        }
        this.title = title;
        this.cover = cover;
        this.detail = metaInfo;
        this.pageNum = pages;
        this.url = galleryUrl;
        this.imgPerPage = imgPerPage;
        this.imageNum = Number(metaInfo["length"].match(/\d*/)[0]);
        print("GalleryInformation:", this)
    }

    get isGallery() {
        return /\/e(x|-)hentai\.org\/g\//.test(window.location.href)
    }
}

class ImageMeta {
    constructor(page, index, url = "", pageUrl = "", width = 100, height = 139) {
        this._url = url;
        this.nl = "";
        this._imagePageUrl = pageUrl;
        this.width = width;
        this.height = height;
        this.galleryPage = page;
        this._state = 0;
        this.stateProxy = null;
        this.index = index;
        this.imageWidget = null
    }

    get url() {
        return this._url
    }

    set url(value) {
        this._url = value;
        if (value.indexOf("http") > -1) {
            this.state = 4
        }
    }

    get imagePageUrl() {
        return this._imagePageUrl
    }

    set imagePageUrl(value) {
        this._imagePageUrl = value;
        if (value.indexOf("hentai.org/s/") > -1) {
            this.state = 2
        }
    }

    get state() {
        return this._state
    }

    set state(value) {
        if (this._state === -1) {
            return
        }
        const lastValue = this._state;
        this._state = value;
        !!this.stateProxy && lastValue !== value && this.stateProxy.call(this, value)
    }

    isGetPage() {
        return !!this.imagePageUrl
    }

    isGetUrl() {
        return !!this.url
    }

    loadIntoWidget() {
        if (this.state > 3 && this.url) {
            this.imageWidget.updateImageDOM()
        } else {
            if (this.state > 1 && this.imagePageUrl) {
                this.callImageUrl()
            } else {
                this.callPageUrl()
            }
        }
    }

    callPageUrl() {
        this.state = 1;
        this.galleryPage.callPageUrl(this.imageWidget)
    }

    callImageUrl() {
        this.state = 3;
        GET.call(this, this.imagePageUrl, function (d) {
            var imgUrl = d.match(/<img id=\"img\" src=\"(.+?)\"/i)[1];
            var nl = d.match(/onclick=\"return nl\(\'(.+?)\'\)\"/i)[1];
            this.url = imgUrl;
            this.nl = nl;
            this.imageWidget.updateImageDOM()
        }, "text")
    }

    get isLoaded() {
        return !!this.url
    }

    get isShow() {
    }
}

class GalleryPage {
    constructor(index, size, pageUrl, timeout = 5e3) {
        const images = [];
        for (let i = 0; i < size; i++) {
            images.push(new ImageMeta(this, index * size + i))
        }
        this.index = index;
        this.images = images;
        this.url = pageUrl;
        this.callState = 0;
        this.callStack = new Array;
        this.callTimestamp = (new Date).getTime();
        this.isLoaded = false;
        this.timeout = timeout
    }

    getImagePageFromDOM(dom) {
        const imageWidgets = dom.getElementsByClassName("gdtm");
        for (let i = 0; i < imageWidgets.length; i++) {
            const imageWidget = imageWidgets[i];
            const pageUrl = imageWidget.getElementsByTagName("a")[0].href;
            const img = imageWidget.getElementsByTagName("img")[0];
            const height = Number(img.style.height.match(/\d*/)) || 139;
            const width = Number(img.style.width.match(/\d*/)) || 100;
            this.images[i].imagePageUrl = pageUrl;
            this.images[i].height = height;
            this.images[i].width = width
        }
        this.isLoaded = true;
        print("get image page from dom finish: page", this.index, this)
    }

    clearCallStack() {
        while (this.callStack.length > 0) {
            const imageWidget = this.callStack.shift();
            imageWidget.updateArea();
            imageWidget.imgInfo.callImageUrl()
        }
    }

    callPageUrl(imageWidget) {
        if (this.callState > 1) {
            imageWidget.imgInfo.callImageUrl();
            return
        }
        if (this.callState == 1) {
            this.callStack.push(imageWidget);
            return
        }
        this.callState = 1;
        this.callTimestamp = (new Date).getTime();
        this.callStack.push(imageWidget);
        const url = this.url;
        GET.call(this, url, function (d) {
            const imageWidgets = d.getElementsByClassName("gdtm");
            for (let i = 0; i < imageWidgets.length; i++) {
                const imageWidget = imageWidgets[i];
                const pageUrl = imageWidget.getElementsByTagName("a")[0].href;
                const img = imageWidget.getElementsByTagName("img")[0];
                const height = Number(img.style.height.match(/\d*/)) || 139;
                const width = Number(img.style.width.match(/\d*/)) || 100;
                this.images[i].imagePageUrl = pageUrl;
                this.images[i].height = height;
                this.images[i].width = width
            }
            this.isLoaded = true;
            this.clearCallStack()
        }, "html")
    }
}

class ImageParser {
    constructor(information) {
        const imageNum = information.imageNum;
        const pageNum = information.pageNum;
        let galleryPages = [];
        for (let i = 0; i < pageNum; i++) {
            const pageUrl = information.url + "?p=" + i.toString();
            galleryPages.push(new GalleryPage(i, information.imgPerPage, pageUrl))
        }
        this.imageNum = imageNum;
        this.imgPerPage = information.imgPerPage;
        this.galleryPages = galleryPages;
        this.galleryPages[0].getImagePageFromDOM(document.body)
    }
}

class Config {
    constructor(scriptDOM) {
        print("reading config ...");
        this.loadConfig();
        const scriptUrl = scriptDOM.getAttribute("src").match(/(http.*?\/)Reader.*\.js/)[1] || this.getLocalConfig("scriptUrl");
        const isTranslate = this.getLocalConfig("isTranslate") || scriptDOM.getAttribute("translate") || "true";
        const isOpenBlank = this.getLocalConfig("isOpenBlank") || scriptDOM.getAttribute("openBlank") || "true";
        const fontSize = this.getLocalConfig("fontSize") || eval(scriptDOM.getAttribute("fontsize")) || 9;
        const lineColor = this.getLocalConfig("lineColor") || eval(scriptDOM.getAttribute("line-color")) || "rgb(20,20,20)";
        const tagFontSize = this.getLocalConfig("tagFontSize") || eval(scriptDOM.getAttribute("tag-fontsize")) || 9;
        const lazyLoadingSize = this.getLocalConfig("lazyLoadingSize") || eval(scriptDOM.getAttribute("lazy-loadingsize")) || 5;
        const isInfiniteLoading = this.getLocalConfig("isInfiniteLoading").toString() || true;
        this.fontSize = Number(fontSize);
        this.tagFontSize = Number(tagFontSize);
        this.lazyLoadingSize = Number(lazyLoadingSize);
        this.lineColor = lineColor;
        this.isTranslate = isTranslate === "true" || isTranslate === true ? true : false;
        this.isOpenBlank = isOpenBlank === "true" || isOpenBlank === true ? true : false;
        this.scriptUrl = scriptUrl;
        this.isInfiniteLoading = isInfiniteLoading === "true" || isInfiniteLoading === true ? true : false;
        this.$registers = {
            fontSize: ["文字字号", "select_8_40"],
            tagFontSize: ["标签字号", "select_8_40"],
            lazyLoadingSize: ["同时加载图片数", "select_1_20"],
            lineColor: ["分界线颜色", "input"],
            isInfiniteLoading: ["开启无限加载", "bibox"],
            isTranslate: ["是否翻译", "bibox"],
            isOpenBlank: ["是否在新标签打开画廊", "bibox"]
        };
        this.saveConfig();
        print("config:", this)
    }

    change(configName, value) {
        this[configName] = value;
        this.saveConfig()
    }

    getLocalConfig(name) {
        if (name in this._config) {
            return this._config[name].toString()
        } else {
            return ""
        }
    }

    toString() {
        const _config = {};
        for (let key in this) {
            if (key.startsWith("_") || key.startsWith("$")) {
                continue
            }
            _config[key] = this[key]
        }
        return JSON.stringify(_config)
    }

    saveConfig() {
        localStorage.setItem("ReaderConfig", this.toString())
    }

    loadConfig() {
        const config = !!localStorage.getItem("ReaderConfig") ? JSON.parse(localStorage.getItem("ReaderConfig")) : {};
        this._config = config
    }
}

class ImageWidget {
    constructor(webStructure, pageInfo, imgInfo, index, parent, containerWidth) {
        if (index !== imgInfo.index) {
            throw new Error(`ImageWidget index:${index} do not match ImageMeta index:${imgInfo.index} `)
        }
        const blankImageUrl = "//ehgt.org/g/blank.gif";
        const width = containerWidth;
        imgInfo.containerWidth = containerWidth;
        imgInfo.imageWidget = this;
        const height = width / imgInfo.width * imgInfo.height;
        const container = document.createElement("div");
        container.className = "image-container";
        const loadingBox = document.createElement("div");
        loadingBox.className = "loading-box";
        const img = document.createElement("img");
        img.setAttribute("id", "img" + index);
        img.setAttribute("name", "anchor" + index);
        img.setAttribute("order", index);
        img.setAttribute("style", `display:none;width:${width}px;height:${height}px;border:0px;`);
        img.setAttribute("class", "reader-img");
        img.setAttribute("src", blankImageUrl);
        img.onerror = e => {
            if (typeof e === "number") {
                this.state = e;
            }
            print(`Image load fail ${this.index}`);
            const button = this.addReloadButton();
            button.click();
        };
        img.onload = () => {
            if (this.img.src.indexOf(this.blankImageUrl) < 0) {
                this.state = -1;
                this.imgInfo.width = this.img.naturalWidth;
                this.imgInfo.height = this.img.naturalHeight;
                this.updateArea();
                this.webStructure.removeLoading(this.index);
                this.removeLoadButton();
            }
        };
        imgInfo.stateProxy = value => {
            print(`stateProxy: index:${this.index} state:${this.state}`);
            if (this.isShow) {
                if (this.state >= 1 && this.state < 6) {
                    this.loadingBoxShow("Loading ...")
                }
                if (this.state === 6) {
                    this.loadingBoxShow("Loading from the original ...")
                }
            }
            if (this.state === -1) {
                this.loadingBoxHiden()
            }
        };
        const line = document.createElement("div");
        line.setAttribute("class", "reader-img-line");
        container.appendChild(loadingBox);
        container.appendChild(img);
        container.appendChild(line);
        parent.appendChild(container);
        this.imgInfo = imgInfo;
        this.webStructure = webStructure;
        this.pageInfo = pageInfo;
        this.img = img;
        this.imgLine = line;
        this.loadingBox = loadingBox;
        this.imageContainer = container;
        this.containerWidth = containerWidth;
        this.blankImageUrl = blankImageUrl;
        this.pos = getOffsetTopByBody(this.img) || -1;
        this._waitingTime = 2e3
    }

    get state() {
        return this.imgInfo.state
    }

    set state(value) {
        this.imgInfo.state = value
    }

    get index() {
        return this.imgInfo.index
    }

    get isLoaded() {
        return this.state === -1
    }

    get isLoading() {
        return this.state == 5 || this.state == 6
    }

    get isLoadStart() {
        return this.isLoading || this.isLoaded
    }

    get index() {
        return this.imgInfo.index
    }

    get isLoaded() {
        return this.state === -1
    }

    get isLoading() {
        return this.state == 5 || this.state == 6
    }

    get isLoadStart() {
        return this.isLoading || this.isLoaded
    }

    reloadImage() {
        if (this.state >= 5) {
            this.imgInfo.imagePageUrl += "?nl=" + this.imgInfo.nl;
            this.imgInfo.url = "";
            this.imgInfo.nl = ""
        }
        print(`Reloading Image: ${this.index} state: ${this.state}`);
        this.imgInfo.loadIntoWidget()
    }

    addReloadButton() {
        if (this.button || this.state == -1) {
            return this.button
        }
        const button = document.createElement("div");
        this.button = button;
        const buttonIcon = document.createElement("i");
        button.setAttribute("class", "reader-image-reload-button");
        buttonIcon.setAttribute("class", "iconfont icon-refresh");
        button.appendChild(buttonIcon);
        this.imageContainer.appendChild(button);
        button.onclick = e => {
            this.webStructure.actionListener.cancelTouch();
            this.reloadImage();
            this.removeLoadButton()
        }
        return this.button
    }

    removeLoadButton() {
        this.button && this.button instanceof HTMLElement && this.button.parentElement.removeChild(this.button);
        this.button = null
    }

    loadingBoxShow(message) {
        if (message !== this.loadingBox.innerText) {
            this.loadingBox.innerText = message
        }
        this.loadingBox.style.display = "block"
    }

    loadingBoxHiden() {
        this.loadingBox.style.display = "none"
    }

    updateImageDOM() {
        if (this.img.src !== this.imgInfo.url && this.state != -1) {
            this.state++;
            this.img.src = this.imgInfo.url;
            setTimeout(this.timeout.bind(this), this._waitingTime)
        }
    }

    timeout() {
        if (!this.isLoaded) {
            print(`image ${this.index} timeout`);
            this.addReloadButton();
            this.loadingBoxHiden()
        }
    }

    callPosRefresh() {
        this.webStructure.updatePosAfter(this.index)
    }

    updateArea() {
        const display = this.img.style.display;
        this.img.style.display = "none";
        const containerWidth = this.imgInfo.containerWidth;
        const width = containerWidth;
        const height = containerWidth / this.imgInfo.width * this.imgInfo.height;
        this.img.style.height = `${height}px`;
        this.img.style.width = `${width}px`;
        this.img.style.display = display;
        this.callPosRefresh()
    }

    updatePos() {
        const pos = getOffsetTopByBody(this.img);
        this.pos = pos || -1
    }

    get isShow() {
        return this.img.style.display != "none"
    }

    show() {
        this.webStructure.addLoading(this.index);
        this.img.style.display = "block";
        this.imgLine.style.display = "block";
        this.updatePos();
        this.imgInfo.loadIntoWidget()
    }

    hide() {
        this.img.style.display = "none"
    }
}

class StyleProxy {
    constructor(selector) {
        this._selector = selector;
        this._styleDom = document.createElement("style");
        this._styles = {};
        this.isStyleChanged = false;
        document.head.appendChild(this._styleDom)
    }

    setStyle(key, value, suffix = "") {
        if (key instanceof Array && value instanceof Array) {
            if (key.length !== value.length) {
                throw Error("keys and values do not match")
            } else {
                for (let i = 0; i < key.length; i++) {
                    if (this._styles[key[i]] !== `${value[i]}${suffix}`) {
                        this._styles[key[i]] = `${value[i]}${suffix}`;
                        this.isStyleChanged = true
                    }
                }
            }
        } else {
            if (this._styles[key] !== `${value}${suffix}`) {
                this._styles[key] = `${value}${suffix}`;
                this.isStyleChanged = true
            }
        }
    }

    refresh() {
        if (this.isStyleChanged) {
            let style = "";
            for (let key in this._styles) {
                style += `${key}:${this._styles[key]};`
            }
            this._styleDom.innerHTML = `${this._selector}{${style}}`;
            this.isStyleChanged = false
        }
    }
}

class ConfigProxy {
    constructor(config) {
        this.config = config;
        this._styleProxys = {};
        this._styleProxysSet = new Set
    }

    bindStyleProxy(configName, styleProxy, styleName, suffix = "") {
        if (!(configName in this._styleProxys)) {
            this._styleProxys[configName] = new Array
        }
        this._styleProxys[configName].push([styleProxy, styleName, suffix]);
        this._styleProxysSet.add(styleProxy)
    }

    updateStyleProxy() {
        for (let configName in this._styleProxys) {
            for (let proxyInfo of this._styleProxys[configName]) {
                const [styleProxy, styleName, suffix] = proxyInfo;
                styleProxy.setStyle(styleName, this.config[configName], suffix)
            }
        }
        for (let proxy of this._styleProxysSet) {
            proxy.refresh()
        }
    }

    getLineDOM() {
        const line = document.createElement("tr");
        line.setAttribute("class", "reader-menu-config-line ");
        return line
    }

    getTitleDOM(title) {
        const dom = document.createElement("td");
        dom.setAttribute("class", "reader-menu-config-title reader-menu-config-font");
        dom.innerText = title;
        return dom
    }

    getEditDOM(configName, type) {
        const editBox = document.createElement("td");
        editBox.setAttribute("class", `reader-menu-config-edit reader-menu-config-font`);
        if (type.startsWith("input")) {
            const edit = document.createElement("input");
            edit.setAttribute("class", "reader-menu-config-font");
            edit.setAttribute("configname", configName);
            edit.value = this.config[configName];
            editBox.appendChild(edit);
            const config = this.config;
            edit.onchange = e => {
                const input = e.target;
                let value = input.value;
                if (type.indexOf("number") > -1) {
                    value = Number(value)
                }
                const configName = input.getAttribute("configname");
                this.config.change(configName, value);
                this.updateStyleProxy()
            }
        }
        if (type.startsWith("select")) {
            const params = type.split("_");
            const start = Number(params[1]);
            const end = Number(params[2]);
            const select = document.createElement("select");
            select.setAttribute("configname", configName);
            select.setAttribute("class", "reader-menu-config-font");
            for (let i = start; i <= end; i++) {
                const option = document.createElement("option");
                option.value = i;
                option.innerText = i;
                select.appendChild(option)
            }
            select.value = this.config[configName];
            select.onchange = e => {
                const select = e.target;
                const value = Number(select.value);
                const configName = select.getAttribute("configname");
                this.config.change(configName, value);
                this.updateStyleProxy()
            };
            editBox.appendChild(select)
        }
        if (type.startsWith("bibox")) {
            const positive = document.createElement("label");
            const negative = document.createElement("label");
            const value = this.config[configName];
            const positiveChecked = value ? "checked" : "";
            const negativeChecked = value ? "" : "checked";
            positive.innerHTML = `<input type="radio" name="${configName}" value="positive" ${positiveChecked}>是`;
            positive.setAttribute("class", "reader-menu-config-font");
            negative.innerHTML = `<input type="radio" name="${configName}" value="negative" ${negativeChecked}>否`;
            negative.setAttribute("class", "reader-menu-config-font");
            positive.onchange = e => {
                const box = e.target;
                const configName = box.getAttribute("name");
                const value = box.checked;
                this.config.change(configName, value)
            };
            negative.onchange = e => {
                const box = e.target;
                const configName = box.getAttribute("name");
                const value = !box.checked;
                this.config.change(configName, value)
            };
            editBox.appendChild(positive);
            editBox.appendChild(negative)
        }
        return editBox
    }

    getConfigDOM() {
        const registers = this.config.$registers;
        const configBox = document.createElement("table");
        configBox.setAttribute("class", "reader-menu-config-box");
        for (let configName in registers) {
            const [title, type] = registers[configName];
            const lineDOM = this.getLineDOM();
            const titleDOM = this.getTitleDOM(title);
            const editDOM = this.getEditDOM(configName, type);
            lineDOM.appendChild(titleDOM);
            lineDOM.appendChild(editDOM);
            configBox.appendChild(lineDOM)
        }
        return configBox
    }
}

class WebStructure {
    constructor(configProxy, galleryInformation) {
        this.config = configProxy.config;
        this.galleryInformation = galleryInformation;
        this.loadQueue = [];
        this.loadingQuery = new Set;
        this.imageWidgets = [];
        this.galleryPages = [];
        this.resetDynamicStyle(configProxy)
    }

    get isGallery() {
        return /\/e(x|-)hentai\.org\/g\//.test(window.location.href)
    }

    get isWaitingForLoad() {
        let count = 0;
        for (let page of this.galleryPages) {
            count += page.callStack.length
        }
        return count > 0
    }

    get hasLoadingImages() {
        return this.loadingQuery.size > 0
    }

    get numOfLoadingImages() {
        return this.loadingQuery.size
    }

    addLoading(index) {
        this.loadingQuery.add(index)
    }

    removeLoading(index) {
        return this.loadingQuery.delete(index)
    }

    rebuildMobileStructure(config, galleryInformation) {
        print("rebuilding mobile structure ...");
        const zoomMeta = document.createElement("meta");
        const titleBox = document.getElementsByClassName("gm")[0];
        const body = document.body
        const titleBackgroud = document.createElement("div");
        const titleInfoCover = document.createElement("div");
        const titleInfoDetail = document.createElement("div");
        const titleTag = document.createElement("div");
        const titleInfo = document.createElement("div");
        const coverratio = 1 / 3;
        const coverImage = document.createElement("img");
        const coverCanvas = document.createElement("canvas");
        const title = document.getElementById("gn");
        const subTitle = document.getElementById("gj");
        const artInfo = document.getElementById("gd3");
        const tag = document.getElementById("gd4");
        const horizontalLine = document.createElement("div");
        const tagAction = document.getElementById("tagmenu_act");
        const tagNew = document.getElementById("tagmenu_new");
        zoomMeta.setAttribute("name", "videoport");
        zoomMeta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1");
        body.style.overscrollBehaviorX = 'none';
        body.style.overflowX = 'hidden';
        document.head.appendChild(zoomMeta);
        titleInfoDetail.appendChild(title);
        titleInfoDetail.appendChild(subTitle);
        titleInfoDetail.appendChild(artInfo);
        titleTag.appendChild(tag);
        titleInfo.appendChild(titleInfoDetail);
        titleBox.innerHTML = "";
        titleBox.appendChild(coverImage);
        titleBox.appendChild(titleBackgroud);
        titleBackgroud.appendChild(titleInfoCover);
        titleBackgroud.appendChild(titleInfo);
        titleBackgroud.appendChild(horizontalLine);
        titleBackgroud.appendChild(titleTag);
        titleBackgroud.setAttribute("class", "reader-title-background");
        coverImage.setAttribute("class", "reader-title-cover-image");
        titleInfoCover.setAttribute("class", "reader-title-top-cover");
        titleInfoDetail.setAttribute("class", "reader-title-top-detail");
        titleTag.setAttribute("class", "reader-title-tag");
        titleInfo.setAttribute("class", "reader-title-info");
        horizontalLine.setAttribute("class", "reader-title-horizontalLine");
        titleInfoCover.style = `height:${Math.floor(document.body.clientWidth * coverratio)}px;`;
        titleBackgroud.style = `background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(51,51,51,0.9) ${Math.floor(document.body.clientWidth * coverratio)}px,rgba(51,51,51,1));`;
        tagAction.style.fontSize = config.fontSize.toString() + "pt";
        coverImage.src = galleryInformation.cover;
        if (document.getElementsByClassName("gpc")[0]) {
            document.getElementsByClassName("gpc")[0].style.display = "none"
        }
        if (document.getElementById("gdo")) {
            document.getElementById("gdo").style.display = "none"
        }
        if (document.getElementsByClassName("gtb").length > 0) {
            for (let g of document.getElementsByClassName("gtb")) {
                g.style.display = "none"
            }
        }
        for (let i = 0; i < tagNew.getElementsByTagName("input").length; i++) {
            tagNew.getElementsByTagName("input")[i].style.fontSize
        }
        for (let i = 0; i < artInfo.childNodes.length; i++) {
            artInfo.childNodes[i].style.fontSize = config.fontSize.toString() + "pt"
        }
        const infoClass = artInfo.childNodes[0];
        infoClass.appendChild(artInfo.childNodes[1].childNodes[0]);
        infoClass.style.display = "flex";
        infoClass.style.flexFlow = "row nowrap";
        infoClass.childNodes[0].setAttribute("style", `height:auto;width:auto;padding:10px 20px 10px 20px;margin:0px 10% 0px 0px;font-size:${config.fontSize}pt;`);
        artInfo.childNodes[3].getElementsByTagName("tr")[1].childNodes[0].style = "padding:0px;text-align:left;";
        artInfo.childNodes[4].style.paddingLeft = "0px";
        document.getElementById("favoritelink").style.whiteSpace = "nowrap";
        title.onclick = function () {
            this.style.whiteSpace = "normal"
        };
        subTitle.onclick = function () {
            this.style.whiteSpace = "normal"
        };
        const infoTable = document.getElementById("gdd");
        if (infoTable) {
            const tableBody = infoTable.getElementsByTagName("tbody")[0];
            const _rows = tableBody.getElementsByTagName("tr");
            const rows = [];
            for (let row of _rows) {
                rows.push(row)
            }
            while (rows.length > 0) {
                const line = document.createElement("div");
                let box = document.createElement("div");
                line.className = "reader-info-detail-row";
                box.className = "reader-info-detail-col";
                let row = rows.shift();
                row.parentElement.removeChild(row);
                box.appendChild(row);
                line.appendChild(box);
                if (rows.length > 0) {
                    box = document.createElement("div");
                    box.className = "reader-info-detail-col";
                    row = rows.shift();
                    row.parentElement.removeChild(row);
                    box.appendChild(row);
                    line.appendChild(box)
                }
                tableBody.appendChild(line)
            }
        }
    }

    scollToTop() {
        document.body.scrollTop = document.documentElement.scrollTop = 0
    }

    forceRefresh() {
        for (let imageWidget of this.imageWidgets) {
            if (!imageWidget.isLoaded) {
                imageWidget.img.src = imageWidget.img.src
            }
        }
    }

    resetReader() {
        localStorage.removeItem("ReaderConfig");
        document.location.href = document.location.href
    }

    initConfigStucture(configProxy) {
        this.configProxy = configProxy;
        const configContainer = document.createElement("div");
        configContainer.setAttribute("class", "reader-menu-config bottom-hidden");
        configContainer.onselectstart = function (e) {
            return false
        };
        configContainer.onscroll = function () {
            scrollBack(configContainer, 20)
        };
        this._configContainer = configContainer;
        document.body.appendChild(configContainer)
    }

    showConfig() {
        function _showConfig() {
            this._configContainer.innerHTML = "";
            this._configContainer.appendChild(configProxy.getConfigDOM());
            this._configContainer.classList.remove("bottom-hidden");
            this.isShowConfig = true;
            if (this._configContainer.clientHeight >= this._configContainer.children[0].clientHeight) {
                this._configContainer.children[0].style.height = `${this._configContainer.clientHeight + 20}px`
            }
        }

        this._configContainer.classList.add("transform-anime");
        _showConfig.call(this);
        this.showConfig = _showConfig
    }

    hideConfig() {
        if (this._configContainer) {
            this._configContainer.classList.add("bottom-hidden");
            this.isShowConfig = false
        }
    }

    initMenuStructure(configProxy) {
        this.initConfigStucture(configProxy);
        const topMenu = document.createElement("div");
        const bottomMenu = document.createElement("div");
        topMenu.setAttribute("class", "reader-menu top-hidden");
        topMenu.setAttribute("id", "top-menu");
        bottomMenu.setAttribute("class", "reader-menu bottom-hidden");
        bottomMenu.setAttribute("id", "bottom-menu");
        this._topMenu = topMenu;
        this._bottomMenu = bottomMenu;
        document.body.appendChild(bottomMenu);
        document.body.onscroll = e => {
            if (this.isShowMenu) {
                this.hideMenu()
            }
            if (this.isShowComments) {
                this.hideComments()
            }
            if (this.isShowConfig) {
                this.hideConfig()
            }
        };
        const iconSettings = document.createElement("i");
        iconSettings.setAttribute("class", "iconfont icon-settings");
        iconSettings.onclick = () => {
            this.hideMenu();
            this.showConfig()
        };
        const iconOriginal = document.createElement("i");
        iconOriginal.setAttribute("class", "iconfont icon-original");
        iconOriginal.onclick = () => {
            window.location.href = window.location.origin + window.location.pathname + "?originalReader=" + parseInt(Date.parse(new Date) / 1e3)
        };
        const iconComments = document.createElement("i");
        iconComments.setAttribute("class", "iconfont icon-comments");
        iconComments.onclick = () => {
            this.hideMenu();
            this.showComments()
        };
        this.isShowMenu = false;
        this.isShowConfig = false;
        this.isShowComments = false;
        this._comments = document.getElementById("cdiv");
        this._comments.classList.add("bottom-hidden");
        this._comments.onscroll = e => {
            scrollBack(this._comments, 20)
        };
        const commentsBox = document.createElement("div");
        commentsBox.innerHTML = this._comments.innerHTML;
        commentsBox.style = "width:100%;margin-bottom:20px;";
        this._comments.innerHTML = "";
        this._comments.appendChild(commentsBox);
        window.scrollTo = function () {
        };
        const iconReset = document.createElement("i");
        iconReset.setAttribute("class", "iconfont icon-refresh");
        iconReset.onclick = () => {
            this.resetReader()
        };
        bottomMenu.appendChild(iconSettings);
        bottomMenu.appendChild(iconReset);
        bottomMenu.appendChild(iconOriginal);
        bottomMenu.appendChild(iconComments)
    }

    showMenu() {
        function _showMenu() {
            this._topMenu.classList.remove("top-hidden");
            this._bottomMenu.classList.remove("bottom-hidden");
            this.isShowMenu = true
        }

        this._topMenu.classList.add("transform-anime");
        this._bottomMenu.classList.add("transform-anime");
        _showMenu.call(this);
        this.showMenu = _showMenu
    }

    hideMenu() {
        this._topMenu.classList.add("top-hidden");
        this._bottomMenu.classList.add("bottom-hidden");
        this.isShowMenu = false
    }

    showComments() {
        function _showComments() {
            this._comments.classList.remove("bottom-hidden");
            this.isShowComments = true
        }

        this._comments.classList.add("transform-anime");
        _showComments.call(this);
        const commentsBox = this._comments.children[0];
        if (commentsBox.scrollHeight < this._comments.clientHeight) {
            commentsBox.style.minHeight = `${this._comments.clientHeight}px`
        }
        this.showComments = _showComments
    }

    hideComments() {
        if (this._comments) {
            this._comments.classList.add("bottom-hidden");
            this.isShowComments = false
        }
    }

    initImageStructure(imageParser) {
        print("initImageStructure");
        const imageNum = imageParser.imageNum;
        const container = document.getElementById("gdt");
        const containerStyle = "padding:0px;width:100%;max-width:none;margin:0px;";
        container.style = containerStyle;
        const containerWidth = document.body.clientWidth;
        const readerContainer = document.createElement("div");
        readerContainer.setAttribute("id", "gdt");
        readerContainer.style = containerStyle;
        this.container = readerContainer;
        const imageWidgets = [];
        const loadQueue = [];
        for (let i = 0; i < imageNum; i++) {
            const numOfPage = Math.floor(i / imageParser.imgPerPage);
            const index = i % imageParser.imgPerPage;
            const imgwidget = new ImageWidget(this, imageParser.galleryPages[numOfPage], imageParser.galleryPages[numOfPage].images[index], i, readerContainer, containerWidth);
            imageWidgets.push(imgwidget);
            loadQueue.push([i, imgwidget])
        }
        this.imageWidgets = imageWidgets;
        this.loadQueue = loadQueue;
        this.galleryPages = imageParser.galleryPages;
        container.parentElement.insertBefore(readerContainer, container);
        container.parentElement.removeChild(container)
    }

    updatePosAfter(index) {
        for (let i = index; i < this.imageWidgets.length; i++) {
            if (this.imageWidgets[i].img.style.display == "none") {
                return
            }
            this.imageWidgets[i].updatePos()
        }
    }

    showImage(index) {
        if (index < this.imageWidgets.length) {
            this.imageWidgets[index].show()
        } else {
            print("@exReader")
        }
    }

    loadStyleFile() {
        const readerStyle = document.createElement("link");
        readerStyle.rel = "stylesheet";
        readerStyle.type = "text/css";
        readerStyle.href = this.config.scriptUrl + "Reader_V2.min.css";
        const iconStyle1 = document.createElement("link");
        iconStyle1.rel = "stylesheet";
        iconStyle1.type = "text/css";
        iconStyle1.href = "//at.alicdn.com/t/font_2872755_lbcgjof8f0e.css";
        document.body.appendChild(readerStyle);
        document.body.appendChild(iconStyle1)
    }

    resetDynamicStyle(configProxy) {
        print("resetting font size style ...");
        const config = configProxy.config;
        const tagStyle = new StyleProxy(".gtw,.gt,.gtl,.gt,.tag");
        const fontStyle = new StyleProxy("h1#gn,h1#gj,loading-box,.tc,.reader-menu-config-font,.reader-info-detail-col td,#cdiv .c6");
        const newTagStyle = new StyleProxy("input#newtagfield,input#newtagbutton");
        const biboxStyle = new StyleProxy("label input");
        const lineStyle = new StyleProxy(".reader-img-line");
        configProxy.bindStyleProxy("tagFontSize", tagStyle, "font-size", "pt");
        configProxy.bindStyleProxy("fontSize", fontStyle, "font-size", "pt");
        configProxy.bindStyleProxy("fontSize", newTagStyle, "font-size");
        configProxy.bindStyleProxy("fontSize", biboxStyle, "width", "pt");
        configProxy.bindStyleProxy("fontSize", biboxStyle, "height", "pt");
        configProxy.bindStyleProxy("lineColor", lineStyle, "background-color");
        configProxy.updateStyleProxy();
        const style = document.createElement("style");
        let styleText = "";
        styleText += "#gn,#gj{text-overflow: ellipsis;white-space: nowrap;overflow: hidden;cursor:pointer;}";
        styleText += "input#newtagfield,input#newtagbutton{line-height:normal;}";
        styleText += "input#newtagfield{width:70%;}";
        styleText += "input#newtagbutton{width:auto;}";
        style.innerHTML = styleText;
        document.head.appendChild(style)
    }

    isFirstLoadFinished() {
        let isFinished = true;
        for (let i = 0; i < Math.min(this.config.lazyLoadingSize, this.galleryInformation.imageNum); i++) {
            if (!this.imageWidgets[i].isLoaded) {
                isFinished = false;
                break
            }
        }
        if (isFinished) {
            print("First load finished.");
            this.isFirstLoadFinished = function () {
                return true
            };
            return true
        } else {
            return false
        }
    }

    getLoadStates() {
        const states = [];
        for (let imageWidget of this.imageWidgets) {
            states.push(imageWidget.isLoaded)
        }
        return states
    }

    translate() {
        window.selectedTag = null;

        function translateTag(tagDict) {
            let tagBox = document.getElementsByClassName("gtl");
            for (var i = 0; i < tagBox.length; i++) {
                tagBox[i].classList.add("tag")
            }
            tagBox = document.getElementsByClassName("gtw");
            for (var i = 0; i < tagBox.length; i++) {
                tagBox[i].classList.add("tag")
            }
            tagBox = document.getElementsByClassName("gt");
            for (var i = 0; i < tagBox.length; i++) {
                tagBox[i].classList.add("tag")
            }
            tagBox = document.getElementsByClassName("tag");
            for (let tagc of tagBox) {
                const tag = tagc.getElementsByTagName("a")[0] || tagc;
                tagc.setAttribute("selected", false);
                const tagName = tag.innerText;
                tag.innerText = tagDict[tagName] || tagName;
                tag.setAttribute("tagName", tagName);
                tag.setAttribute("translateName", tag.innerText);
                tagc.onclick = function (event) {
                    if (event && event.target != event.currentTarget) {
                        var tag = this.getElementsByTagName("a")[0];
                        if (window.selectedTag == this) {
                            tag.innerText = tag.getAttribute("translateName");
                            window.selectedTag = null
                        } else {
                            tag.innerHTML = tag.getAttribute("tagName");
                            if (window.selectedTag) {
                                var otag = window.selectedTag.getElementsByTagName("a")[0];
                                otag.innerText = otag.getAttribute("translateName")
                            }
                            window.selectedTag = this
                        }
                    }
                }
            }
        }

        let tagDict = localStorage.getItem("tagDic");
        tagDict = JSON.parse(tagDict);
        if (tagDict && "TAGDICVERSION" in tagDict && Number(tagDict["TAGDICVERSION"]) >= CURRENT_TAG_DICT_VERSION) {
            translateTag(tagDict)
        } else {
            GET.call(this, this.config.scriptUrl + "tag.json.js?" + parseInt(Date.parse(new Date) / 1e3), function (data) {
                let tagDict = data;
                localStorage.setItem("tagDic", JSON.stringify(tagDict));
                translateTag(tagDict)
            }, "jsonp")
        }
    }

    blankHyperlink() {
        const links = document.getElementsByTagName("a");
        if (links.length < 1) {
            requestAnimationFrame(this.blankHyperlink)
        } else {
            let sum = 0;
            for (let a of links) {
                if (/(ex|e-)hentai.org\/g\//.test(a.href)) {
                    sum++;
                    a.target = "_blank"
                }
            }
            if (!sum) {
                requestAnimationFrame(this.blankHyperlink)
            } else {
                print("blank hyperlink")
            }
        }
    }
}

class ActionListener {
    constructor(config, webStructure) {
        this.lazyLoadingSize = config.lazyLoadingSize;
        this.webStructure = webStructure;
        this.webStructure.actionListener = this;
        this.isTouch = false;
        this.config = config
    }

    get timestamp() {
        return (new Date).getTime()
    }

    touchEvent(times) {
        print(`touch times: ${times}`);
        if (times === 1) {
            if (!this.webStructure.isShowMenu) {
                this.webStructure.showMenu()
            } else {
                this.webStructure.hideMenu()
            }
            this.webStructure.isShowComments && this.webStructure.hideComments();
            this.webStructure.isShowConfig && this.webStructure.hideConfig()
        }
        this.touchTimes = 0
    }

    cancelTouch() {
        clearTimeout(this.touchEventId);
        this.touchTimes = 0
    }

    listenTouch() {
        this.touchTimes = 0;
        this.touchEventId = 0;
        const launchTouchEvent = e => {
            clearTimeout(this.touchEventId);
            this.touchTimes++;
            this.touchEventId = setTimeout(() => {
                this.touchEvent(this.touchTimes)
            }, 300)
        };
        const imageArea = document.getElementById("gdt");
        imageArea.ontouchstart = e => {
            this.isTouch = true
        };
        imageArea.ontouchmove = e => {
            this.isTouch = false;
            this.cancelTouch()
        };
        imageArea.ontouchend = e => {
            if (this.isTouch) {
                launchTouchEvent()
            } else {
            }
            window.this = false
        }
    }

    listenScroll() {
        const seenCurrentImageWidget = this.getFocus();
        const targetWidget = seenCurrentImageWidget + this.lazyLoadingSize;
        if (this.webStructure.loadQueue.length > 0 && this.webStructure.loadQueue[0][0] <= targetWidget) {
            this.lazyLoad(targetWidget)
        }
        if (this.config.isInfiniteLoading && this.webStructure.isFirstLoadFinished() && this.webStructure.numOfLoadingImages < this.lazyLoadingSize && this.webStructure.loadQueue.length > 0) {
            this.infinitLoad(this.lazyLoadingSize - this.webStructure.numOfLoadingImages)
        }
        requestAnimationFrame(this.listenScroll.bind(this))
    }

    infinitLoad(nums) {
        for (let i = 0; i < nums; i++) {
            print("infinite Loading:");
            const [index, widget] = this.webStructure.loadQueue.shift();
            widget.show();
            if (this.webStructure.loadQueue.length < 1) {
                return
            }
        }
    }

    lazyLoad(targetWidget) {
        while (this.webStructure.loadQueue.length > 0 && this.webStructure.loadQueue[0][0] <= targetWidget) {
            const [index, widget] = this.webStructure.loadQueue.shift();
            widget.show()
        }
    }

    getFocus() {
        const currentTop = document.documentElement.scrollTop;
        const currentBottom = currentTop + document.documentElement.clientHeight;
        let index = -1;
        for (let imageWidget of this.webStructure.imageWidgets) {
            if (imageWidget.pos < currentBottom && imageWidget.isLoadStart) {
                index += 1
            } else {
                break
            }
        }
        return index
    }
}

print("Run Manakanemu/Exhentai Reader");
var VERSION = 1.3;
var CURRENT_TAG_DICT_VERSION = 1.3;
var isLoadOrigin = window.location.href.indexOf("originalReader=") > -1;
if (isLoadOrigin) {
    const href = window.location.href.split("&");
    const orginTimestamp = parseInt(href[0].split("=")[1]);
    if (parseInt(Date.parse(new Date) / 1e3) - orginTimestamp > 2) {
        isLoadOrigin = false
    } else {
        isLoadOrigin = true
    }
}
if (!isLoadOrigin) {
    var config = new Config(document.getElementById("exReader"));
    var configProxy = new ConfigProxy(config);
    var galleryInformation = new GalleryInformation;
    var webStructure = new WebStructure(configProxy, galleryInformation);
    if (config.isOpenBlank && /e(x|-)hentai.org\/($|tag|\?)/.test(document.location.href)) {
        webStructure.blankHyperlink()
    }
    if (config.isTranslate) {
        webStructure.translate()
    }
    if (webStructure.isGallery) {
        webStructure.scollToTop();
        webStructure.loadStyleFile();
        webStructure.rebuildMobileStructure(config, galleryInformation);
        webStructure.initMenuStructure(configProxy);
        var imageParser = new ImageParser(galleryInformation);
        webStructure.initImageStructure(imageParser);
        var actionListener = new ActionListener(config, webStructure);
        actionListener.listenScroll();
        actionListener.listenTouch()
    }
}
