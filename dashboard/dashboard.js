import { database, ref, get } from '../login/firebase.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Get user data from sessionStorage with validation
        const userDatos = JSON.parse(sessionStorage.getItem("userData"));
        
        if (!userDatos || !userDatos.idNumber) {
            window.location.href = "/login/login.html";
            return;
        }

        // 2. Mostrar información básica del usuario
        const nombreElement = document.getElementById("nombre");
        const cuentaElement = document.getElementById("cuenta");
        const saldoElement = document.getElementById("saldo");
        const ingresosElement = document.getElementById("total-ingresos");
        const gastosElement = document.getElementById("total-gastos");

        // Validar que todos los elementos existan
        if (!nombreElement || !cuentaElement || !saldoElement || !ingresosElement || !gastosElement) {
            console.error("Elementos del DOM no encontrados");
            mostrarError("Error de configuración de la página");
            return;
        }

        // Mostrar datos del usuario
        nombreElement.textContent = `Hola, ${userDatos.name || ''} ${userDatos.lastname || ''}`;
        cuentaElement.textContent = `Cuenta: ${userDatos.numeroCuenta || 'N/A'}`;
        saldoElement.textContent = `Saldo disponible: $${(userDatos.saldo || 0).toLocaleString('es-CO')}`;

        // 3. Consultar transacciones en Firebase
        const id = userDatos.idNumber; // Definir id aquí
        const transRef = ref(database, `users/${id}/transaccion`);
        const snapshot = await get(transRef);

        // 4. Calcular totales de ingresos y gastos
        if (snapshot.exists()) {
            const transaccion = snapshot.val();
            let totalIngresos = 0;
            let totalGastos = 0;

            const transaccionesArray = Object.keys(transaccion).map(key => {
                // Convertir cantidad a número (manejar strings y números)
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
            gastosElement.textContent = `$${totalGastos.toFixed(2)}`;
            
            // Aquí podrías añadir el código para mostrar las transacciones en la tabla
        } else {
            console.log("No hay transacciones disponibles");
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
    