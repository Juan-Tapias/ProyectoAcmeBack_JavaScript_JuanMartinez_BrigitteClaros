
document.addEventListener("DOMContentLoaded", () =>{
    const userDatos = JSON.parse(sessionStorage.getItem("userData"));

    if (!userDatos) {
        window.location.href = "/login/login.html";
        return;
    }
    const nombreCompleto = userDatos.name + " " + userDatos.lastname
    
    document.getElementById("nombre").textContent = `Hola, ${nombreCompleto}`;
    document.getElementById("cuenta").textContent = `Cuenta: ${userDatos.numeroCuenta}`;
    document.getElementById("nombre-certificado").textContent = `${nombreCompleto}`;
    document.getElementById("id-certificado").textContent = `${userDatos.idNumber};`
    document.getElementById("N-cuenta").textContent = `${userDatos.numeroCuenta}`;
    document.getElementById("fecha-apertura").textContent = `${userDatos.fecha}`
})
