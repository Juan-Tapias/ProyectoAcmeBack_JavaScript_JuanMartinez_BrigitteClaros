import { database, ref, set, get, update } from '../login/firebase.js';

document.addEventListener("DOMContentLoaded", async () => {
    const userDatos = JSON.parse(sessionStorage.getItem("userData"));

    if (!userDatos) {
        window.location.href = "/login/login.html";
        return;
    }

    const nombreCompleto = userDatos.name + " " + userDatos.lastname;
    const numeroCuenta = userDatos.numeroCuenta;

    // Mostrar información del usuario
    document.getElementById("nombre").textContent = `Nombre: ${nombreCompleto}`;
    document.getElementById("cuenta").textContent = `Cuenta: ${numeroCuenta}`;

    const cantidadInput = document.getElementById("cantidad");
    const botonRetirar = document.getElementById("consignar"); // Cambiar el ID a "retirar" en el HTML
    
    const id = userDatos.idNumber;
    const saldo = userDatos.saldo // Referencia al saldo dentro de transaccion

    botonRetirar.addEventListener("click", async () => {
        const cantidad = parseFloat(cantidadInput.value);
        
        if (!cantidad || cantidad <= 0) {
            alert("Ingrese una cantidad válida");
            return;
        }

        // Verificar saldo suficiente
        if (cantidad > saldo) {
            alert("Saldo insuficiente para realizar el retiro");
            return;
        }

        // Generar número de referencia aleatorio
        const numeroReferencia = 'R' + Math.floor(10000000 + Math.random() * 90000000);
        
        // Crear objeto de transacción (histórico)
        const transaccionHistorico = {
            fecha: new Date().toLocaleString(),
            referencia: numeroReferencia,
            tipo: "Retiro",
            descripcion: "Retiro de dinero",
            cantidad: cantidad,
            cuenta: numeroCuenta,
            nombre: nombreCompleto
        };

        try {
            // Registrar la transacción en el historial
            const historialRef = ref(database, `users/${id}/transaccion/${numeroReferencia}`);
            await set(historialRef, transaccionHistorico);
            
            // Actualizar el saldo
            const nuevoSaldo = saldo - cantidad;
            await update(ref(database, `users/${id}`), { 
                saldo: nuevoSaldo,
            });
            
            // Actualizar saldo en sessionStorage
            userDatos.saldo = nuevoSaldo;
            sessionStorage.setItem("userData", JSON.stringify(userDatos));
            
            // Mostrar confirmación
            mostrarConfirmacion(transaccionHistorico);
            
            // Generar ticket
            generarTicket(transaccionHistorico);
            
            // Limpiar campo
            cantidadInput.value = "";
            
        } catch (error) {
            console.error("Error al realizar el retiro:", error);
            alert("Ocurrió un error al procesar el retiro");
        }
    });

    function mostrarConfirmacion(transaccion) {
        const ventana = document.getElementById("ventana-confirmar");
        ventana.style.display = "flex";
        ventana.innerHTML = `
            <div>
                <p>Retiro realizado con éxito</p>
                <p>Fecha: ${transaccion.fecha}</p>
                <p>Número de referencia: ${transaccion.referencia}</p>
                <p>Valor retirado: $${transaccion.cantidad.toLocaleString()}</p>
                <p>Nuevo saldo disponible en unos momentos</p>
            </div>
        `;
        
        setTimeout(() => {
            ventana.style.display = "none";
        }, 5000);
    }

    function generarTicket(transaccion) {
        const ticket = document.getElementById("ticket");
        ticket.innerHTML = `
            <div id="recibo">
                <h3>COMPROBANTE DE RETIRO</h3>
                <hr>
                <p><strong>Nombre:</strong> ${transaccion.nombre}</p>
                <p><strong>Cuenta:</strong> ${transaccion.cuenta}</p>
                <p><strong>Fecha:</strong> ${transaccion.fecha}</p>
                <p><strong>Referencia:</strong> ${transaccion.referencia}</p>
                <p><strong>Tipo:</strong> ${transaccion.tipo}</p>
                <p><strong>Descripción:</strong> ${transaccion.descripcion}</p>
                <hr>
                <p><strong>Valor retirado:</strong> $${transaccion.cantidad.toLocaleString()}</p>
                <hr>
                <p>Estado: COMPLETADO</p>
                <p>Este comprobante es su constancia de la transacción realizada</p>
            </div>
            <button onclick="window.print()" class="btn-imprimir">Imprimir Comprobante</button>
        `;
    }
});