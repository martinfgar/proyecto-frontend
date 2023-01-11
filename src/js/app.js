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

if (getCookie('access_token') != null){
    logged = true;
    document.getElementById('username').innerText = getCookie('user');
}else{
    loginModal.show()
}
if(localStorage.getItem("stocksSelected") !== null){
    JSON.parse(localStorage.stocksSelected).forEach(item => {
        document.getElementById(`card${item}`).classList.remove('d-none')
        document.getElementById('selectedStocks').appendChild(document.getElementById(`${item}`))
    })
    
}

$( function() {
    $( ".configLogo" ).draggable({
        scroll: false,
        axis: "x",
        containment: '#targetImagenes',
        revert: "invalid",
    });
    $(".configLogo").sortable({
        axis: "x"
    })
    $("#selectedStocks").droppable({
        accept: ".configLogo",
        drop: function(e,ui){
            $(e.target).append($(ui.draggable).detach().css({'top':'','left':''}))
        }
    })
    $("#unselectedStocks").droppable({
        accept: ".configLogo",
        drop: function(e,ui){
            $(e.target).append($(ui.draggable).detach().css({'top':'','left':''}))
        }
    })
  } );

  if (/Android|iPhone/i.test(navigator.userAgent)) {
    [...document.getElementsByClassName('configLogo')].forEach(elem => {
        elem.addEventListener('click',() => {
            const id= event.currentTarget.parentNode.id
            if(id == 'selectedStocks'){
                document.getElementById('unselectedStocks').appendChild(event.currentTarget)
            }else{
                document.getElementById('selectedStocks').appendChild(event.currentTarget)
            }
        })
    })
}
async function logIn(){
    var data = new FormData(document.getElementById('loginForm'))
    const res = await fetch('http://localhost:8000/api/login',{
        method: 'POST',
        body: data
    })
    return res.json()
}
async function fetchEmpresas(){
    const res = await fetch(`http://localhost:8000/api/empresas`,{
        headers: {
            Authentication: 'Bearer '+getCookie('access_token')
        }
    })
    return res.json()
}
async function fetchStockData(id_empresa){
    const res = await fetch(`http://localhost:8000/api/acciones/empresa/${id_empresa}`,{
        headers: {
            Authentication: 'Bearer '+getCookie('access_token')
        }
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

document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    var elegidos = [...document.getElementById('selectedStocks').children].map(item => item.id)
    elegidos.forEach(item => document.getElementById(`card${item}`).classList.remove('d-none'))
    var noElegidos = [...document.getElementById('unselectedStocks').children].map(item => item.id)
    noElegidos.forEach(item => document.getElementById(`card${item}`).classList.add('d-none'))
    localStorage.setItem("stocksSelected",JSON.stringify(elegidos))
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
