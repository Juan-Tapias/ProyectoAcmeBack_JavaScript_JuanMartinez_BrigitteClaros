import { database, ref, set, get, update } from '../login/firebase.js';

document.addEventListener("DOMContentLoaded", async () => {
    const userDatos = JSON.parse(sessionStorage.getItem("userData"));
    const imagen = document.getElementById("image-marketing")

    if (!userDatos) {
        window.location.href = "/login/login.html";
        return;
    }

    function cambiarImagenConTransicion(nuevaSrc) {
        imagen.style.opacity = 0;
        setTimeout(() => {
          imagen.src = nuevaSrc;
          imagen.style.opacity = 1;
        }, 500);
      }
      
      function iniciarCicloImagenes() {
        setTimeout(() => {
          cambiarImagenConTransicion("img/seguridad1.png");
        }, 0);
      
        setTimeout(() => {
          cambiarImagenConTransicion("img/seguridad2.png");
        }, 4000);
      
        setTimeout(() => {
          cambiarImagenConTransicion("img/seguridad3.png");
        }, 8000);

        setTimeout(() => {
            cambiarImagenConTransicion("img/seguridad3.png");
          }, 12000);
      }
      
      iniciarCicloImagenes();
      
      setInterval(iniciarCicloImagenes, 16000);

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
            cantidad: -cantidad,
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
            <div>COMPROBANTE DE RETIRO</div>
            <div id="nombre"><strong>Nombre:</strong> ${transaccion.nombre}</div>
            <div id="cuenta"><strong>Cuenta:</strong> ${transaccion.cuenta}</div>
            <div id="fecha"><strong>Fecha:</strong> ${transaccion.fecha}</div>
            <div id="referencia"><strong>Referencia:</strong> ${transaccion.referencia}</div>
            <div id="tipo"><strong>Tipo:</strong> ${transaccion.tipo}</div>
            <div id="descripcion"><strong>Descripción:</strong> ${transaccion.descripcion}</div>
            <div id="cantidad"><strong>Valor retirado:</strong> $${transaccion.cantidad.toLocaleString()}</div>
            <div><strong>Estado:</strong> COMPLETADO</div>
            <div>Este comprobante es su constancia de la transacción realizada</div>
        </div>
        <button onclick="window.print()" class="btn-imprimir">Imprimir Comprobante</button>
        `;
    }
});