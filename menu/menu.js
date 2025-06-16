const items = document.querySelector(".oculto");
const menu = document.getElementById("menu");

function consignacion(){
  window.location.href = "/transacciones/transacciones.html";
}
function movimientos(){
  window.location.href = "/movimientos/movimientos.html";
}
function pagos(){
  window.location.href = "/pagosRecibos/pago.html";
}
function retiros(){
  window.location.href = "/retiros/retiros.html"
}

function extracto(){
  window.location.href = "/extractos/extractos.html"
}

function dashboard(){
  window.location.href = "/dashboard/dashboard.html"
}
function certificado(){
  window.location.href = "/certificado/certificado.html"
}
function cerrarSesion() {
  sessionStorage.setItem('mensajeLogout', 'Sesión cerrada correctamente');

  window.location.href = '/login/login.html';
}
document.addEventListener("DOMContentLoaded", ()=>{
  menu.addEventListener("click", () => {
    if (items.classList.contains("oculto")) {
      items.classList.replace("oculto", "boton-menu");
    } else {
      items.classList.replace("boton-menu", "oculto");
    }
  })
})
