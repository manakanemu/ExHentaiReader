function print(...args){
    console.log(...args)
}
function info(message){
    print('[INFO]:',message)
}
function error(message){
    print('[ERROR]:',message)
}

class GalleryParser{
    constructor(){
        this.gallery_title = ''
        this.gallery_subtitle = ''
        this.gallery_cover = ''
        this.gallery_page = ''

        this.is_init = false
        this.read_gallery_info()
    }
    read_gallery_info(){
        info('read gellery info')
        const title = document.getElementById('gn') && document.getElementById('gn').innerText
        const subtitle = document.getElementById('gj') && document.getElementById('gj').innerText || ''
        if(title){
            this.gallery_title = title
            this.gallery_subtitle = subtitle
            const e_cover = document.getElementById('gd1')
            const cover_url = e_cover.innerHTML.match(/url\((.*)\) no-repeat/i)[1]
            this.gallery_cover = cover_url || ''
            this.is_init = true
        }
        if(!this.is_init){
            requestAnimationFrame(this.read_gallery_info.bind(this))
        }
    }
}
var gp = new GalleryParser()
