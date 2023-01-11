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
var settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'),{
    keyboard: false
})
var modalChart = new bootstrap.Modal(document.getElementById('modalChart'),{
    keyboard: false
})
var ctx = document.getElementById('grafico');
var chart;
var empresas;
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


async function register(){
    var data = new FormData(document.getElementById('signUpForm'))
    const res = await fetch('http://localhost:8000/api/register',{
        method: 'POST',
        body: data
    })
    return res.json()
}

async function logIn(){
    var data = new FormData(document.getElementById('loginForm'))
    const res = await fetch('http://localhost:8000/api/login',{
        method: 'POST',
        body: data,
        Accept: 'application/json'
    })
    return res.json()
}
async function fetchEmpresas(){
    const res = await fetch(`http://localhost:8000/api/empresas`,{
        headers: {
            Authorization: 'Bearer '+getCookie('access_token'),
            Accept: 'application/json'
        }
    })
    return res.json()
}
async function fetchStockData(id_empresa){
    const res = await fetch(`http://localhost:8000/api/acciones/empresa/${id_empresa}`,{
        headers: {
            Authorization: 'Bearer '+getCookie('access_token'),
            Accept: 'application/json'
        }
    })
    return res.json()
}

async function crearChart(empresa){
    if (empresas == undefined){
        empresas = await fetchEmpresas()
    }
    console.log(empresas)
     chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
    });
}

[...document.getElementsByClassName('btn-chart')].forEach(elem => {
    elem.addEventListener('click',async () => {
        if (!logged){
            loginModal.show()
            return
        }
        if(chart != undefined){
            chart.destroy()
        }
        
        crearChart('aa')
        modalChart.show()
    })
})


document.getElementById('signUpForm').addEventListener('submit', async function(event){
    event.preventDefault()  
    const res = await register()
    if (res.access_token != undefined){
        //loginModal.hide()     
        console.log(res.access_token)
        document.cookie = `user = ${res.user.name}; max-age=7200`
        document.cookie = `access_token = ${res.access_token}; max-age=7200`
    }else{
        document.getElementById('loginAlert').classList.remove('d-none')
        document.getElementById('loginAlert').innerText = res.message
    }
})



document.getElementById('loginForm').addEventListener('submit',async function(event){
    event.preventDefault()
    const res = await logIn()
    console.log(res)
    if (res.access_token != undefined){
        console.log(res.access_token)
        document.cookie = `user = ${res.user.name}; max-age=7200`
        document.cookie = `access_token = ${res.access_token}; max-age=7200`
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
        logged = true
        document.getElementById('username').innerText = getCookie('user')
        empresas =  fetchEmpresas()   
    }else if (getCookie('access_token') == null && logged){
        document.getElementById('username').innerText = ''
        logged = false
        loginModal.show()
    }
},100)
