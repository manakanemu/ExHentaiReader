function copy(str) {
    var input = document.createElement('input')
    input.value = str
    document.body.appendChild(input)
    input.select()
    document.execCommand("Copy");
    document.body.removeChild(input);
}

function genJS(attrs) {
    var jsAddress = '"https://manakanemu.github.io/ExHentaiReader/Reader.js?"'
    var attrString = ''

    for (var i = 0; i < attrs.length; i++) {
        var attr = attrs[i]
        if (attr.value) {
            attrString += 's.setAttribute("' + attr.attrName + '","' + attr.value + '");'
        }
    }

    var jsString = 'javascript:(function(){var s=document.createElement("script");s.setAttribute("id","exReader");s.setAttribute("src", ' + jsAddress + '+parseInt(Date.parse(new Date())/100));'
    jsString += attrString + "document.body.appendChild(s);}())"
    return jsString
}
$(function () {

    var app = new Vue({
        el: '#app',
        data: {
            attribute: [
                {
                    name: '标签尺寸:',
                    placeholder: '请输入1～999整数,不修改则留空',
                    tip: '标签尺寸是指本子分类标签的大小，通过输入不同数字可以放大或缩小标签，可以多次调整寻找自己手机最合适的大小。',
                    attrName: 'tag-fontsize',
                    value: '',
                    type:'input'
                },
                {
                    name: '工具栏尺寸:',
                    placeholder: '请输入1～999整数，不修改则留空',
                    tip: '工具栏尺寸是指上滑时激活的工具栏的大小，通过输入不同数字可以放大或缩小工具栏，可以多次调整寻找自己手机最合适的大小。',
                    attrName: 'toolbar-size',
                    value: '',
                    type:'input'
                }
            ],
            adAttribute:[
                {
                    name: '分割线颜色:',
                    placeholder: '请输入16进制颜色值，如：#409EFF ',
                    tip: '分割线颜色是指脚本将每页本子竖向排列后，本子间间隔线的颜色，默认为黄色，可以修改为你希望的颜色。',
                    attrName: 'line-color',
                    value: '#FFFF00',
                    type:'colorPicker'
                },
                {
                    name:'标签翻译:',
                    value:'true',
                    attrName:'translate',
                    tip:'开启后会将分类标签翻译为中文，不会翻译作者、角色等个性化标签。(注：中文翻译是我自己翻译的，如果觉得哪个标签翻译欠妥欢迎提意见)',
                    type:'switch',
                    active:'翻译',
                    inactive:'不翻译'
                }
            ],
            adButton: "更多配置选项",
            command: '',
            adStyle:'display:none;'
        },
        methods: {
            genCode() {
                if($('.ad-box').css('display').indexOf('none') < 0){
                    var attrs = this.attribute.concat(this.adAttribute)
                }else{
                    var attrs = this.attribute
                }
                var jsString = genJS(attrs)
                this.command = jsString
                copy(jsString)
                this.$message({
                    message: '代码以复制到剪贴板，如果复制失败请手动复制。',
                    type: 'success',
                    duration:'5000'
                  });
            },
            selectCode(){
                alert(1)
            },
            showAd(e) {
                this.adStyle=''
                $('.ad-button').hide()
            }
        }

    })

    $('#code').click(function(){
        this.select()
    })
})