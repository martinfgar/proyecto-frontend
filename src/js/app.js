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



var logged = false
var loginModal = new bootstrap.Modal(document.getElementById('loginModal'), {
    keyboard: false
  })

function hideLogin(){
    loginModal.hide();
    [...document.querySelectorAll('.modal-backdrop')].forEach(x => x.remove())
}

if (getCookie('access_token') != null){
    logged = true;
    document.getElementById('username').innerText = getCookie('user');
    [...document.querySelectorAll('.unlogged')].forEach(elem => elem.classList.add('d-none'));
    [...document.querySelectorAll('.logged')].forEach(elem => elem.classList.remove('d-none'));
    document.getElementById('loggedContainer').insertAdjacentHTML('beforeend',getCookie('access_token'))
}else{
    [...document.querySelectorAll('.unlogged')].forEach(elem => elem.classList.remove('d-none'));
    [...document.querySelectorAll('.logged')].forEach(elem => elem.classList.add('d-none'));
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
    console.log(res)
    if (res.access_token != undefined){
        hideLogin()
        document.cookie = `user = ${res.user.name}; max-age=15`
        document.cookie = `access_token = ${res.access_token}; max-age=15`
    }else{
        document.getElementById('loginAlert').classList.remove('d-none')
        document.getElementById('loginAlert').innerText = res.message
    }
})


//Listener para cambiar el estado de los elementos cuando se está logueado o no
var cookieListener = setInterval(() => {
    if (getCookie('access_token') != null && !logged){
        logged = true;
        document.getElementById('username').innerText = getCookie('user');
        [...document.querySelectorAll('.unlogged')].forEach(elem => elem.classList.add('d-none'));
        [...document.querySelectorAll('.logged')].forEach(elem => elem.classList.remove('d-none'));
    }else if (getCookie('access_token') == null && logged){
        [...document.querySelectorAll('.unlogged')].forEach(elem => elem.classList.remove('d-none'));
        [...document.querySelectorAll('.logged')].forEach(elem => elem.classList.add('d-none'));
        logged = false
    }
},100)
