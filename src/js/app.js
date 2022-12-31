function getCookie(name) {
    var cookieArr = document.cookie.split(";");
    for(var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        if(name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}
//document.cookie = "access_token = cheese"

if (getCookie('access_token') != null){
    document.getElementById('mainPanel').insertAdjacentHTML('beforeend',getCookie('access_token'))
}else{
    document.getElementById('mainPanel').insertAdjacentHTML('beforeend','patata')
}