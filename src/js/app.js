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
function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=0'
}
var updateInterval;
var updateTime;
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

async function loggin(){
    logged = true;
    document.getElementById('username').innerText = getCookie('user');
    await UpdateCardsEmpresas()
    document.getElementById('logOut').classList.remove('d-none')
    document.getElementById('logIn').classList.add('d-none')
}
async function logout(){
    logged = false
    document.getElementById('username').innerText = ''
    await UpdateCardsEmpresas()
    document.getElementById('logIn').classList.remove('d-none')
    document.getElementById('logOut').classList.add('d-none')
    loginModal.show()
}

if (getCookie('access_token') != null){
    loggin()
}else{
    logout()
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
});

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
resetContador()
async function register(){
    var data = new FormData(document.getElementById('signUpForm'))
    const res = await fetch('http://localhost:8000/api/register',{
        method: 'POST',
        body: data,
        Accept: 'application/json'
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
    const idEmpresa = empresas.find(emp => (emp.nombre).toLowerCase() == empresa.toLowerCase()).id
    const datos = await fetchStockData(idEmpresa)
    const valores = datos.map(a => a.valor)
    const fechas = datos.map(a => a.fecha.replace(' ','\n'))
    chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: fechas,
          datasets: [{
            label: `Acciones de ${empresa.toUpperCase()}`,
            data: valores,
            borderWidth: 1,
            tension: 0.3
          }]
        },
        options: {
          locale: 'es-ES',
          scales: {
            y: {
                ticks:{
                    callback: (value,index,ticks) => `${value}€ `
                },
              beginAtZero: true
            },
            x:{
                ticks:{
                    maxTicksLimit: 10
                }
            }
          },
          plugins:{
            zoom:{
                zoom:{
                    pan:{
                        mode: 'x'
                    },
                    drag:{
                        enabled: true,
                        backgroundColor: `#9AD0F5`
                    },
                    wheel:{
                        enabled: true
                    },
                    pinch:{
                        enabled: true
                    },
                    mode: 'x'
                }
            }
          }
        }
    });
}

async function UpdateCardEmpresa(empresa){
    if (empresas == undefined){
        empresas = await fetchEmpresas()
    }
    const idEmpresa = empresas.find(emp => (emp.nombre).toLowerCase() == empresa.toLowerCase()).id
    const values = await fetchStockData(idEmpresa)
    const latest_value = values[values.length-1].valor
    const prev = values[values.length-2].valor
    document.getElementById(`price-${empresa}`).innerText = latest_value+'€';
    if ((parseFloat(latest_value)-parseFloat(prev))>0){
        document.getElementById(`price-${empresa}`).classList.add('text-success')
        document.getElementById(`price-${empresa}`).classList.remove('text-danger')
    }else if ((parseFloat(latest_value)-parseFloat(prev))<0){
        document.getElementById(`price-${empresa}`).classList.remove('text-success')
        document.getElementById(`price-${empresa}`).classList.add('text-danger')
    }
    setTimeout(() => {
        document.getElementById(`price-${empresa}`).classList.remove('text-success')
        document.getElementById(`price-${empresa}`).classList.remove('text-danger')
    },5000)

}
async function UpdateCardsEmpresas(){
    if(localStorage.getItem("stocksSelected") !== null){
        JSON.parse(localStorage.stocksSelected).forEach(async (item) =>{
            if (logged){   
                await UpdateCardEmpresa(item)
            }else{
                document.getElementById(`price-${item}`).innerHTML = '';
                document.getElementById(`price-${item}`).classList.remove('text-success')
            }
        })    
    }
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
        await crearChart(elem.id.replace('btn-',''))
        modalChart.show()
    })
})

function resetContador(){
    clearInterval(updateInterval)
    updateTime = 60
    updateInterval = setInterval(() =>  {
        updateTime--; 
        document.getElementById('timer').innerText = updateTime
    },1000)
}

document.getElementById('signUpForm').addEventListener('submit', async function(event){
    event.preventDefault()  
    const res = await register()
    if (res.access_token != undefined){
     
        document.cookie = `user = ${res.user.name}; max-age=7200`
        document.cookie = `access_token = ${res.access_token}; max-age=7200`
        loginModal.hide()
        $(".modal-backdrop").remove()
    }else{
        document.getElementById('loginAlert').classList.remove('d-none')
        document.getElementById('loginAlert').innerText = res.message
    }
})

document.getElementById('logOut').addEventListener('click', () => {
    eraseCookie('access_token')
})
    


document.getElementById('loginForm').addEventListener('submit',async function(event){
    event.preventDefault()
    const res = await logIn()
    if (res.access_token != undefined){
        document.cookie = `user = ${res.user.name}; max-age=7200`
        document.cookie = `access_token = ${res.access_token}; max-age=7200`
        loginModal.hide()
        $(".modal-backdrop").remove()
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
    UpdateCardsEmpresas()
})


//Listener para cambiar el estado de los elementos cuando se está logueado o no
var cookieListener = setInterval(async () => {
    if (getCookie('access_token') != null && !logged){
        await loggin()
        empresas =  await fetchEmpresas()   
    }else if (getCookie('access_token') == null && logged){
        await logout()
    }
},100)

//Cambiamos los valores mostrados en las tarjetas
setInterval(async() => {
    await UpdateCardsEmpresas()
    resetContador()
},60*1000)
