// pc
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
function imgLoadSuccess(element) {
    window.loaded++
    var order = this.getAttribute('order')
    barComplete(order)
    if (window.loaded >= window.pageUrls.length) {
        hideElement(document.getElementById('barBox'))
    }
}
function imgLoadFailed() {
    this.setAttribute('src', this.src)
}
function loadImg(i, first) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', window.pageUrls[i], true)
    xhr.onload = function () {
        if (this.status === 200) {
            var imgUrl = this.responseText.match(/<img id=\"img\" src=\"(.+?)\"/i)[1]
            var nl = this.responseText.match(/onclick=\"return nl\(\'(.+?)\'\)\"/i)[1]
            window.imgUrls[i] = imgUrls
            window.nls[i] = nl
            var img = document.getElementById('img' + i)
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

if (!window.initReader) {
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
    var container = document.getElementById('gdt')
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
        loadImg(i, true)
    }
} else {
    window.loaded = 0
    for (var i = 0; i < window.pageUrls.length; i++) {
        if (!window.imgElements[i].complete) {
            window.progressBars[i].style.backgroundColor = '#ffa502'
            if (!window.imgUrls[i]) {
                loadImg(i, false)
            } else {
                window.pageUrls[i] += '?nl=' + window.nls[i]
                loadImg(i, false)
            }
        } else {
            window.loaded++
        }
    }
    if (window.loaded >= window.pageUrls.length) {
        hideElement(document.getElementById('barBox'))
    }
}