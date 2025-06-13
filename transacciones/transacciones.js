import { database, ref, set, get, update} from '../login/firebase.js'

document.addEventListener("DOMContentLoaded", async () => {


    const userDatos = JSON.parse(sessionStorage.getItem("userData"));

    if (!userDatos) {
        window.location.href = "/login/login.html";
        return;
    }

    const nombreCompleto = userDatos.name + " " + userDatos.lastname

    document.getElementById("nombre").textContent = `Hola, ${nombreCompleto}`;
    document.getElementById("cuenta").textContent = `Cuenta: ${userDatos.numeroCuenta}`;
    const cantidad = document.getElementById("cantidad");
    const botonEnviar = document.getElementById("consignar");
   
        botonEnviar.addEventListener("click", async () => {
            const fecha = new Date();
            const opciones = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
            };
        
            const fechaFormateada = fecha.toLocaleString('es-ES', opciones);
            if (!cantidad.value){
                alert("ingrese la cantidad primero")
            } else{
            const transaccion = {
                fecha: fechaFormateada,
                tipo: "Consignación",
                descripcion: "Consignación por canal electrónico",
                cantidad: cantidad.value, 
            };
            const referencia = 'R' + Math.floor(10000000 + Math.random() * 90000000);
            const saldo = userDatos.saldo
                    const id = userDatos.idNumber;
                    const nuevoSaldo = (Number(saldo)) + (Number(cantidad.value));
                    console.log(nuevoSaldo)
                    await update(ref(database, `users/${id}`), { 
                        saldo: nuevoSaldo,
                    });
                    
                    userDatos.saldo = nuevoSaldo;
                    sessionStorage.setItem("userData", JSON.stringify(userDatos));

            const nuevaTransRef = ref(database, `users/${id}/transaccion/${referencia}`);
            await set(nuevaTransRef, transaccion);
            ventana(referencia)
            ticket(referencia, nuevoSaldo)
            cantidad.value = ""
        }}
        );
    function ventana(numero){
        const fecha = new Date();
        const opciones = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
        };
    
        const fechaFormateada = fecha.toLocaleString('es-ES', opciones);
        const ventana = document.getElementById("ventana-confirmar")
        if (ventana.style.display === "none" || ventana.style.display === ""){
        ventana.style.display = "flex"
        const html = `
        <div>
            <p>Transacción realizada con exito.</p>
            <p>Fecha de creación: ${fechaFormateada}</p>
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


    async function ticket(numeroCuenta, saldo){
        const fecha = new Date();
        const opciones = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
        };
    
        const fechaFormateada = fecha.toLocaleString('es-ES', opciones);
        const ticket = document.getElementById("ticket");
    
        const html = `
            <div id="recibo">
                <div>RECIBO DE CONSIGNACIÓN</div>
                <div id="fecha"></div>
                <div id="tipo"></div>
                <div id="descripcion"></div>
                <div id="cantidad"></div>
                <div>Saldo disponible: $${saldo}</div>
                <div>Estado: RECIBIDO ✅</div>
            </div>
            <button onclick="window.print()">Imprimir Recibo</button>
        `;
        ticket.innerHTML = html;
    
        const id = JSON.parse(sessionStorage.getItem("userData")).idNumber;
        const transRef = ref(database, `users/${id}/transaccion/${numeroCuenta}`);
        const snapshot = await get(transRef);
        if (snapshot.exists()) {
            const transaccion = snapshot.val();
    
            document.getElementById("fecha").textContent = `Fecha: ${fechaFormateada}`;
            document.getElementById("tipo").textContent = `Tipo: ${transaccion.tipo}`;
            document.getElementById("descripcion").textContent = `Descripción: ${transaccion.descripcion}`;
            document.getElementById("cantidad").textContent = `Cantidad: $${transaccion.cantidad}`;
        } 
    }
});


