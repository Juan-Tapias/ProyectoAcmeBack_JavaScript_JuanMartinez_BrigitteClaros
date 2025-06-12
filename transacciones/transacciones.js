import { database, ref, set, get} from '../login/firebase.js'

let numeroP = 12300000

document.addEventListener("DOMContentLoaded", async () => {

    const userDatos = JSON.parse(sessionStorage.getItem("userData"));

    if (!userDatos) {
        window.location.href = "/login/login.html";
        return;
    }

    const nombreCompleto = userDatos.name + " " + userDatos.lastname

    document.getElementById("nombre").textContent = `Nombre: ${nombreCompleto}`;
    document.getElementById("cuenta").textContent = `Cuenta: ${userDatos.numeroCuenta}`;

    const cantidad = document.getElementById("cantidad");
    const botonEnviar = document.getElementById("consignar");
    
    const id = userDatos.idNumber;
    const transRef = ref(database, `users/${id}/transaccion`);
   
        botonEnviar.addEventListener("click", async () => {
            if (!cantidad.value){
                alert("ingrese la cantidad primero")
            } else{
                const snapshot = await get(transRef);
                let maxNumero = 12300000;
                
                if (snapshot.exists()) {
                    const transacciones = snapshot.val();
                    Object.keys(transacciones).forEach(key => {
                        const num = parseInt(key.substring(1)); 
                        if (num > maxNumero) {
                            maxNumero = num;
                        }
                    });
                }

                const nuevoNumero = `M${maxNumero + 1}`;

            const transaccion = {
                fecha: new Date().toLocaleDateString(),
                tipo: "Consignación",
                descripcion: "Consignación por canal electrónico",
                cantidad: cantidad.value, 
            };

            const nuevaTransRef = ref(database, `users/${id}/transaccion/${nuevoNumero}`);
            await set(nuevaTransRef, transaccion);
            ventana(nuevoNumero)
            ticket(nuevoNumero)
            cantidad.value = ""
        }}
        );
    function ventana(numero){
        const ventana = document.getElementById("ventana-confirmar")
        if (ventana.style.display === "none" || ventana.style.display === ""){
        ventana.style.display = "flex"
        const html = `
        <div>
            <p>Transacción realizada con exito.</p>
            <p>Fecha de creación: ${new Date().toLocaleDateString()}</p>
            <br>
            <p>Numero de referencía: ${numero}</p>
        </div>
        `
        ventana.innerHTML = html
    
        setTimeout(() => {
            ventana.style.display = "none";
            ventana.innerHTML = ""; 
        }, 5000);
        }}

    function ticket(numeroCuenta){
        const ticket = document.getElementById("ticket")

        const html = `
        <div id="recibo">
            <div>RECIBO DE CONSIGNACIÓN</div>
            <div id ="fecha"></div>
            <div id="tipo"></div>
            <div id="descripcion"></div>
            <div id="cantidad"></div>
            <div >Estado: RECIBIDO ✅</div>
        </div>
        <button onclick="window.print()">Imprimir Recibo</button>
        `
        ticket.innerHTML = html

        const transKeys = Object.keys(userDatos.transaccion);
        const ultimaKey = transKeys[transKeys.length - 1];
        const transaccion = userDatos.transaccion[ultimaKey];

        document.getElementById("fecha").textContent = `Fecha: ${transaccion.fecha}`
        document.getElementById("tipo").textContent = `Fecha: ${transaccion.tipo}`
        document.getElementById("descipcion").textContent = `Fecha: ${transaccion.descripcion}`
        document.getElementById("cantidad").textContent = `Fecha: ${userDatos.transaccion.cantidad}`
    }
});


