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
        this.num_pictures = 0
        this.num_picture_per_page = 0
        this._is_init = false
        this.init_waiting_stack = []
        this.init()
    }
    get is_init(){
        return this._is_init
    }
    set is_init(value){
        this._is_init = value
        if(value === true){
            for(let func of this.init_waiting_stack){
                func()
            }
        }
    }
    init(){
        this.read_gallery_info()
    }
    read_gallery_info(){
        function get_right_info(key){
            const e_info = document.getElementById('gdd')
            const e_rows = e_info.getElementsByTagName('tr')
            for(let e_row of e_rows){
                const e_key = e_row.getElementsByClassName('gdt1')[0]
                const e_value = e_row.getElementsByClassName('gdt2')[0]
                const _key = e_key.innerText.trim().replace(':','')
                const _value = e_value.innerText.trim()
                if(key ===_key){
                    return _value
                }
            }
            return null
        }
        info('read gellery info')
        const title = document.getElementById('gn') && document.getElementById('gn').innerText
        if(title){
            try{
                const subtitle = document.getElementById('gj') && document.getElementById('gj').innerText || ''
                const e_cover = document.getElementById('gd1')
                const cover_url = e_cover.innerHTML.match(/url\((.*)\) no-repeat/i)[1]
                const num_pictures = get_right_info('Length')
                const num_picture_per_page = document.getElementsByClassName('gdtm').length

                this.gallery_title = title
                this.gallery_subtitle = subtitle
                this.gallery_cover = cover_url
                this.gallery_page = window.location.origin + window.location.pathname
                this.num_picture_per_page = num_picture_per_page
                this.num_pictures = Number(num_pictures.replace('pages',''))
                
                this.is_init = true
            }catch(e){
                error(e)
            }
        }
        if(!this.is_init){
            requestAnimationFrame(this.read_gallery_info.bind(this))
        }
    }
}
class PictureInfo{
    constructor(){
        
        this.num_pictures = 0
        this.
        this._is_init = false
        this.init_waiting_stack = []


        if(gp.is_init){
            this.init()
        }else{
            gp.init_waiting_stack.push(this.init.bind(this))
        }
    }
    get is_init(){
        return this._is_init
    }
    set is_init(value){
        this._is_init = value
        if(value === true){
            for(let func of this.init_waiting_stack){
                func()
            }
        }
        
    }

    init(){
        print('infoinit')
    }
}
var gp = new GalleryParser()
var pi = new PictureInfo()

