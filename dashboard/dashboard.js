import { database, ref, get } from '../login/firebase.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const userDatos = JSON.parse(sessionStorage.getItem("userData"));
        
        if (!userDatos || !userDatos.idNumber) {
            window.location.href = "/login/login.html";
            return;
        }

        // 2. Mostrar información básica del usuario
        const nombreElement = document.getElementById("nombre");
        const cuentaElement = document.getElementById("cuenta");
        const ingresosElement = document.getElementById("total-ingresos");
        const gastosElement = document.getElementById("total-gastos");
        const balanceElement = document.getElementById("balance-total")

        if (!nombreElement || !cuentaElement || !ingresosElement || !gastosElement) {
            console.error("Elementos del DOM no encontrados");
            mostrarError("Error de configuración de la página");
            return;
        }
        const nombreCompleto = userDatos.name + " " + userDatos.lastname


        nombreElement.textContent = `Hola, ${nombreCompleto}`;
        cuentaElement.textContent = `Cuenta: ${userDatos.numeroCuenta }`;
        
        const id = userDatos.idNumber; // Definir id aquí
        const transRef = ref(database, `users/${id}/transaccion`);
        const snapshot = await get(transRef);

        if (snapshot.exists()) {
            const transaccion = snapshot.val();
            let totalIngresos = 0;
            let totalGastos = 0;


            const transaccionesArray = Object.keys(transaccion).map(key => {
                const cantidad = typeof transaccion[key].cantidad === 'string' 
                    ? parseFloat(transaccion[key].cantidad.replace(/[^0-9.-]/g, '')) 
                    : Number(transaccion[key].cantidad) || 0;
                
                // Sumar a totales
                if (cantidad > 0) {
                    totalIngresos += cantidad;
                } else {
                    totalGastos += Math.abs(cantidad);
                }

                return {
                    id: key,
                    cantidad: cantidad,
                    descripcion: transaccion[key].descripcion || 'Sin descripción',
                    fecha: transaccion[key].fecha || 'N/A',
                    tipo: transaccion[key].tipo || 'Sin tipo'
                };
            });
            // Actualizar la interfaz
            ingresosElement.textContent = `$${totalIngresos.toFixed(2)}`;
            balanceElement.textContent = `$${(userDatos.saldo || 0).toLocaleString('es-CO')}`;
            gastosElement.textContent = `$${totalGastos.toFixed(2)}`;
            
            // Aquí podrías añadir el código para mostrar las transacciones en la tabla
        } else {
            console.log("No hay transacciones disponibles");
            balanceElement.textContent = "$0.00"
            ingresosElement.textContent = "$0.00";
            gastosElement.textContent = "$0.00";
        }
    } catch (error) {
        console.error("Error en el dashboard:", error);
        mostrarError("Error al cargar datos financieros");
    }
});

function mostrarError(mensaje) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = mensaje;
        errorElement.style.display = 'block';
    }
}
    