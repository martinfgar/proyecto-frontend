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


if (getCookie('access_token') != null){
    document.getElementById('mainPanel').insertAdjacentHTML('beforeend',getCookie('access_token'))
}else{
    document.getElementById('mainPanel').insertAdjacentHTML('beforeend','patata')
}

async function logIn(){
    var data = new FormData(document.getElementById('loginForm'))
    const res = await fetch('http://localhost:8000/api/login',{
        method: 'POST',
        body: data
    })
    return res.json()
}



document.getElementById('loginForm').addEventListener('submit',async function(event){
    event.preventDefault()
    document.getElementById('loginAlert').classList.add('d-none')
    const res = await logIn()
    if (res.access_token != undefined){
        document.cookie = `access_token = ${res.access_token}; max-age=15`
    }else{
        document.getElementById('loginAlert').classList.remove('d-none')
        document.getElementById('loginAlert').innerText = res.message
    }
})

chrome.cookies.onChanged.addListener((changedCookie) => {
    console.log(JSON.stringify(changedCookie.cookie))
})