import { database, ref, set, get} from '../login/firebase.js'
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


    async function ticket(numeroCuenta){
        const ticket = document.getElementById("ticket");
    
        const html = `
            <div id="recibo">
                <div>RECIBO DE CONSIGNACIÓN</div>
                <div id="fecha"></div>
                <div id="tipo"></div>
                <div id="descripcion"></div>
                <div id="cantidad"></div>
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
    
            document.getElementById("fecha").textContent = `Fecha: ${transaccion.fecha}`;
            document.getElementById("tipo").textContent = `Tipo: ${transaccion.tipo}`;
            document.getElementById("descripcion").textContent = `Descripción: ${transaccion.descripcion}`;
            document.getElementById("cantidad").textContent = `Cantidad: $${transaccion.cantidad}`;
        } 
    }
});


