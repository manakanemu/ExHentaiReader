function addCookie(cookieInfo) {
    for(let key in cookieInfo){
        const value = cookieInfo[key]
        document.cookie = `${key}=${value};path=/;domain=.exhentai.org`
    }
    window.location.href = 'https://exhentai.org'
}
function getCoookieInfo() {
    const scriptAnchors = document.getElementsByTagName('script')
    const cookieAnchor = scriptAnchors[scriptAnchors.length-1]
    const cookieInfo = {}
    cookieInfo['igneous'] = cookieAnchor.getAttribute('igneous')
    cookieInfo['ipb_member_id'] = cookieAnchor.getAttribute('ipb_member_id')
    cookieInfo['ipb_pass_hash'] = cookieAnchor.getAttribute('ipb_pass_hash')
    cookieInfo['star'] = cookieAnchor.getAttribute('star')
    cookieInfo['sk'] = ''
    cookieInfo['yay'] = '0'
    return cookieInfo
}

if(window.location.href.indexOf('exhentai.org') > -1){
    const cookieInfo = getCoookieInfo()
    addCookie(cookieInfo)
}else {
    window.location.href = 'https://exhentai.org/favicon.ico'
}