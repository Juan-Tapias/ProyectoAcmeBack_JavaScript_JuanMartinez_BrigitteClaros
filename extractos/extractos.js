import { database, ref, get } from '../login/firebase.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Obtener datos del usuario de sessionStorage
        const userDatos = JSON.parse(sessionStorage.getItem("userData"));

        if (!userDatos) {
            window.location.href = "/login/login.html";
            return;
        }

        // 2. Mostrar información del usuario
        const nombreCompleto = `${userDatos.name} ${userDatos.lastname}`;
        document.getElementById("nombre").textContent = `Titular: ${nombreCompleto}`;
        document.getElementById("cuenta").textContent = `N° Cuenta: ${userDatos.numeroCuenta}`;

        // 3. Configurar selectores de fecha
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const yearSelect = document.getElementById("year");
        for (let year = currentYear; year >= currentYear - 3; year--) {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }

        yearSelect.value = currentYear;
        document.getElementById("month").value = currentMonth;

        // 4. Obtener transacciones de Firebase
        const id = userDatos.idNumber;
        if (!id) {
            throw new Error("ID de usuario no encontrado");
        }

        const transRef = ref(database, `users/${id}/transaccion`);
        const snapshot = await get(transRef);

        if (!snapshot.exists()) {
            mostrarMensajeSinTransacciones();
            return;
        }

        const transaccionesData = snapshot.val();

        // 5. Generar extracto inicial
        generarExtracto(transaccionesData, currentYear, currentMonth);

        // 6. Configurar el event listener del formulario
        document.getElementById("filter-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const year = parseInt(document.getElementById("year").value);
            const month = parseInt(document.getElementById("month").value);
            
            if (isNaN(year) || isNaN(month)) {
                mostrarError("Seleccione un año y mes válidos");
                return;
            }
            
            generarExtracto(transaccionesData, year, month);
        });

    } catch (error) {
        console.error("Error:", error);
        mostrarError("Error al cargar datos del usuario");
        document.querySelector("#tabla-transacciones tbody").innerHTML = `
            <tr><td colspan="5">Error al cargar transacciones</td></tr>
        `;
    }
});

function generarExtracto(transaccionesData, year, month) {
    if (!transaccionesData) {
        mostrarMensajeSinTransacciones();
        return;
    }

    const transacciones = Object.entries(transaccionesData).map(([ref, trans]) => ({
        referencia: ref,
        cantidad: parseFloat(trans.cantidad) || 0,
        descripcion: trans.descripcion || 'Sin descripción',
        fecha: trans.fecha || 'N/A',
        tipo: trans.tipo || 'Sin tipo'
    }));

    // Filtrar por mes y año
    const transaccionesFiltradas = transacciones.filter(trans => {
        if (!trans.fecha || trans.fecha === 'N/A') return false;
        
        const [monthTrans, dayTrans, yearTrans] = trans.fecha.split('/').map(Number);
        const fullYearTrans = yearTrans < 100 ? 2000 + yearTrans : yearTrans;
        
        return fullYearTrans === year && monthTrans === month;
    });

    // Ordenar por fecha (más reciente primero)
    transaccionesFiltradas.sort((a, b) => {
        const dateA = new Date(a.fecha.split('/').reverse().join('-'));
        const dateB = new Date(b.fecha.split('/').reverse().join('-'));
        return dateB - dateA;
    });

    mostrarTransacciones(transaccionesFiltradas, year, month);
}

function mostrarTransacciones(transacciones, year, month) {
    const tbody = document.querySelector("#tabla-transacciones tbody");
    tbody.innerHTML = '';

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                       "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    document.getElementById("extracto-title").textContent = 
        `Extracto Bancario - ${monthNames[month - 1]} ${year}`;

    if (transacciones.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No hay transacciones para este período</td></tr>`;
        return;
    }

    transacciones.forEach(trans => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${formatearFecha(trans.fecha)}</td>
            <td>${trans.referencia}</td>
            <td>${trans.tipo}</td>
            <td>${trans.descripcion}</td>
            <td class="${trans.cantidad >= 0 ? 'positivo' : 'negativo'}">
                ${trans.cantidad >= 0 ? '+' : ''}$${trans.cantidad.toLocaleString('es-CO')}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function formatearFecha(fechaStr) {
    if (!fechaStr || fechaStr === 'N/A') return 'N/A';
    const [month, day, year] = fechaStr.split('/');
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

function mostrarMensajeSinTransacciones() {
    document.querySelector("#tabla-transacciones tbody").innerHTML = `
        <tr><td colspan="5">No se encontraron transacciones</td></tr>
    `;
}

function mostrarError(mensaje) {
    // Implementa tu propio sistema de notificación de errores
    console.error(mensaje);
    alert(mensaje); // Ejemplo básico
}