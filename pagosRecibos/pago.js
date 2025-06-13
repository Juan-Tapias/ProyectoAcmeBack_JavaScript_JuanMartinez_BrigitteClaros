import { database, ref, set, get} from '../login/firebase.js'

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
        const servicios = document.getElementById("servicios").value
        const referencia = document.getElementById("referencia").value
        const total = document.getElementById("total").value
        const informacion = document.getElementById("informacion")
    
        if (!servicios || !referencia || !total){
            informacion.textContent = "Todos los campos son obligatorios"
        }else{
            const id = userDatos.idNumber;
            const transRef = ref(database, `users/${id}/transaccion`);
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
                referencia: nuevoNumero,
                tipo: "Retiro",
                descripcion: `Pago de servicio público ${servicios}`,
                cantidad: `-${total}`
            }
    
    
            const nuevaTransRef = ref(database, `users/${id}/transaccion/${nuevoNumero}`);
            await set(nuevaTransRef, transaccion);
            ventana(nuevoNumero, total)
            ticket(total, servicios, nuevoNumero)
            document.getElementById("servicios").value = ""
            document.getElementById("referencia").value = ""
            document.getElementById("total").value = ""
        }
    })

})

function ventana(numero, valor){
    const ventanaPago = document.getElementById("ventana-pagos")
    if (ventanaPago.style.display === "none" || ventanaPago.style.display === ""){
        ventanaPago.style.display = "flex"
        const html = `
        <div>
            <p>Transacción realizada con exito.</p>
            <p>Fecha: ${new Date().toLocaleDateString()}</p>
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

function ticket(total, recibo, trans){
    const ticket = document.getElementById("ticket")

    const html = `
    <div id="recibo">
        <div>RECIBO DE PAGO DE SERVICIOS</div>
        <div><p>fecha: ${new Date().toLocaleDateString()}</p></div>
        <div><p>servicio pago: ${recibo}</p></div>
        <div><p>Total pago: ${total}</p></div>
        <div><p>Numero de transacción: ${trans}</p></div>
        <div>Estado: RECIBIDO ✅</div>
    </div>
    <button onclick="window.print()">Imprimir Recibo</button>
    `

    ticket.innerHTML = html
}