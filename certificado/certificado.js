
document.addEventListener("DOMContentLoaded", () =>{
    const userDatos = JSON.parse(sessionStorage.getItem("userData"));

    if (!userDatos) {
        window.location.href = "/login/login.html";
        return;
    }
    const nombreCompleto = userDatos.name + " " + userDatos.lastname
    
    document.getElementById("nombre").textContent = `Hola, ${nombreCompleto}`;
    document.getElementById("cuenta").textContent = `Cuenta: ${userDatos.numeroCuenta}`;
})
