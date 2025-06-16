import { database, ref, get } from '../login/firebase.js';

document.addEventListener("DOMContentLoaded", async () => {
    const userDatos = JSON.parse(sessionStorage.getItem("userData"));

    if (!userDatos) {
        window.location.href = "/login/login.html";
        return;
    }

    const nombreCompleto = userDatos.name + " " + userDatos.lastname

    document.getElementById("nombre").textContent = `Hola, ${nombreCompleto}`;
    document.getElementById("cuenta").textContent = `Cuenta: ${userDatos.numeroCuenta}`;
    
    try {
        const userData = JSON.parse(sessionStorage.getItem("userData") || '{}');
        const id = userData.idNumber;
        if (!id) {
            console.error("ID de usuario no encontrado en sessionStorage");
            return;
        }

        const transRef = ref(database, `users/${id}/transaccion`);
        const snapshot = await get(transRef);


        if (snapshot.exists()) {
            const transaccion = snapshot.val();
            // Convertir objeto de transacciones a array y mapear los datos
            const transaccionesArray = Object.keys(transaccion).map(key => {
                return {
                    id: key,
                    referencia: key,
                    cantidad: parseFloat(transaccion[key].cantidad) || 0,
                    descripcion: transaccion[key].descripcion || 'Sin descripción',
                    fecha: transaccion[key].fecha || 'N/A',
                    tipo: transaccion[key].tipo || 'Sin tipo'
                };
            });

            // Ordenar por fecha (más reciente primero)
            const transaccionesOrdenadas = transaccionesArray.sort((a, b) => {
        const parseFechaCompleta = (fechaStr) => {
            if (!fechaStr) return new Date(0);
            
            const [fechaPart, horaPart = '00:00:00'] = fechaStr.split(' ');
            const [dia, mes, anio] = fechaPart.split('/');
            const [horas, minutos, segundos = '00'] = horaPart.split(':');

            return new Date(
                parseInt(anio),
                parseInt(mes) - 1, // Mes en JS es 0-indexado
                parseInt(dia),
                parseInt(horas),
                parseInt(minutos),
                parseInt(segundos)
            );
        };

        const dateA = parseFechaCompleta(a.fecha);
        const dateB = parseFechaCompleta(b.fecha);
        return dateB - dateA; // Orden descendente: más reciente primero
    }).slice(0, 10); 

            const tbody = document.querySelector("#tabla-transacciones tbody");
            if (!tbody) {
                console.error("No se encontró el elemento #tabla-transacciones tbody");
                return;
            }

            tbody.innerHTML = ''; // Limpiar tabla antes de agregar filas
            
            transaccionesOrdenadas.forEach(trans => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${trans.fecha}</td>
                    <td>${trans.referencia}</td>
                    <td>${trans.tipo}</td>
                    <td>${trans.descripcion}</td>
                    <td class="${trans.cantidad >= 0 ? 'positivo' : 'negativo'}">
                        ${trans.cantidad >= 0 ? '+' : ''}${trans.cantidad.toFixed(2)}
                    </td>
                `;
                tbody.appendChild(fila);
            });
        } else {
            console.log("No hay transacciones para este usuario.");
            // Opcional: mostrar mensaje al usuario en la interfaz
            document.querySelector("#tabla-transacciones tbody").innerHTML = `
                <tr><td colspan="5">No se encontraron transacciones</td></tr>
            `;
        }
    } catch (error) {
        console.error("Error al cargar transacciones:", error);
        // Opcional: mostrar mensaje de error al usuario
        document.querySelector("#tabla-transacciones tbody").innerHTML = `
            <tr><td colspan="5">Error al cargar transacciones</td></tr>
        `;
    }
});