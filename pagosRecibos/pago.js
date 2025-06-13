import { database, ref, set, update} from '../login/firebase.js'

document.addEventListener("DOMContentLoaded", ()=>{
    const userDatos = JSON.parse(sessionStorage.getItem("userData"));

    if (!userDatos) {
        window.location.href = "/login/login.html";
        return;
    }
    
    const nombreCompleto = userDatos.name + " " + userDatos.lastname

    document.getElementById("nombre").textContent = `Hola, ${nombreCompleto}`;
    document.getElementById("cuenta").textContent = `Cuenta: ${userDatos.numeroCuenta}`;
    const pagar = document.getElementById("pagar")

    pagar.addEventListener("click", async ()=>{
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
        const servicios = document.getElementById("servicios").value
        const referencia = document.getElementById("referencia").value
        const total = document.getElementById("total").value
        const informacion = document.getElementById("informacion")
        const numeroReferencia = 'R' + Math.floor(10000000 + Math.random() * 90000000);
    
        if (!servicios || !referencia || !total){
            informacion.textContent = "Todos los campos son obligatorios"
        }else{
            const saldo = userDatos.saldo
            const id = userDatos.idNumber;
            const nuevoSaldo = saldo - total;
            
            await update(ref(database, `users/${id}`), { 
                saldo: nuevoSaldo,
            });
            
            userDatos.saldo = nuevoSaldo;
            sessionStorage.setItem("userData", JSON.stringify(userDatos));
            const transaccion = {
                fecha: fechaFormateada,
                referencia: numeroReferencia,
                tipo: "Retiro",
                descripcion: `Pago de servicio público ${servicios}`,
                cantidad: `-${total}`
            }
    
    
            const nuevaTransRef = ref(database, `users/${id}/transaccion/${numeroReferencia}`);
            await set(nuevaTransRef, transaccion);
            ventana(numeroReferencia, total)
            ticket(total, servicios, numeroReferencia, nuevoSaldo)
            document.getElementById("servicios").value = ""
            document.getElementById("referencia").value = ""
            document.getElementById("total").value = ""
        }
    })

})

function ventana(numero, valor){
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
    const ventanaPago = document.getElementById("ventana-pagos")
    if (ventanaPago.style.display === "none" || ventanaPago.style.display === ""){
        ventanaPago.style.display = "flex"
        const html = `
        <div>
            <p>Transacción realizada con exito.</p>
            <p>Fecha: ${fechaFormateada}</p>
            <p>Numero de referencía: ${numero}</p>
            <p>Valor pagado: ${valor}</p>
        </div>
        `

        ventanaPago.innerHTML = html

        setTimeout(()=>{
            ventanaPago.style.display = "none"
            ventanaPago.innerHTML = ""
        }, 3000)
    }
}

function ticket(total, recibo, trans, saldo){
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
    const ticket = document.getElementById("ticket")

    const html = `
    <div id="recibo">
        <div>RECIBO DE PAGO DE SERVICIOS</div>
        <div><p>fecha: ${fechaFormateada}</p></div>
        <div><p>servicio pago: ${recibo}</p></div>
        <div><p>Total pago: ${total}</p></div>
        <div><p>Numero de transacción: ${trans}</p></div>
        <div><p>Saldo disponible: $${saldo}</p></div>
        <div>Estado: RECIBIDO ✅</div>
    </div>
    <button onclick="window.print()">Imprimir Recibo</button>
    `

    ticket.innerHTML = html
}