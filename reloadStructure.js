if(document.location.href != "https://exhentai.org/"){
    if(confirm('需要先打开exhentai主页再运行脚本，是否打开exhentai主页？')){
        document.location.href = "https://exhentai.org/"
    }
}else{
    document.body.innerHTML = ""
    var mystyle = document.createElement('style')
    mystyle.innerText='html,body,iframe{height:100%;width:100%;}'
    document.head.appendChild(mystyle)
    var f = document.createElement('iframe')
    f.setAttribute('frameborder','0')
    f.setAttribute('src','https://exhentai.org/')
}