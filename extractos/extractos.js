import { database, ref, get } from '../login/firebase.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Get user data from sessionStorage with validation
        const userDatos = JSON.parse(sessionStorage.getItem("userData"));
        
        if (!userDatos || !userDatos.idNumber) {
            window.location.href = "/login/login.html";
            return;
        }

                // Replace this:
        document.getElementById("nombre").textContent = `Titular: ${userDatos.name} ${userDatos.lastname}`;
        document.getElementById("cuenta").textContent = `N° Cuenta: ${formatAccountNumber(userDatos.numeroCuenta)}`;

        // With this safer version:
        const nombreElement = document.getElementById("nombre");
        const cuentaElement = document.getElementById("cuenta");
        const saldoElement = document.getElementById("saldo");

        if (nombreElement && cuentaElement && saldoElement) {
            nombreElement.textContent = `Hola, ${userDatos.name} ${userDatos.lastname}`;
            cuentaElement.textContent = `Cuenta: ${formatAccountNumber(userDatos.numeroCuenta)}`;
            saldoElement.textContent = `Saldo disponible: $${userDatos.saldo.toLocaleString('es-CO')}`;
        } else {
            console.error("One or more required elements not found in DOM");
            mostrarError("Error de configuración de la página");
            return;
        }

        // 3. Configure date selectors with improved logic
        configureDateSelectors();

        // 4. Get transactions from Firebase with better error handling
        const transaccionesData = await fetchTransactions(userDatos.idNumber);
        if (!transaccionesData) {
            mostrarMensajeSinTransacciones();
            return;
        }

        // 5. Generate initial statement with current month/year
        const currentDate = new Date();
        generarExtracto(transaccionesData, currentDate.getFullYear(), currentDate.getMonth() + 1);

        // 6. Set up form event listener with debounce
        setupFilterForm(transaccionesData);

    } catch (error) {
        console.error("Error:", error);
        mostrarError("Error al cargar los datos. Por favor intente más tarde.");
    }
});

// Helper function to format account number for display
function formatAccountNumber(accountNum) {
    return accountNum.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
}

// Improved date selector configuration
function configureDateSelectors() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const yearSelect = document.getElementById("year");
    
    // Clear existing options
    yearSelect.innerHTML = '';
    
    // Add options for current year plus previous 5 years
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    
    // Set current month/year as default
    yearSelect.value = currentYear;
    document.getElementById("month").value = currentDate.getMonth() + 1;
}

// Improved transaction fetching with better error handling
async function fetchTransactions(userId) {
    try {
        const transRef = ref(database, `users/${userId}/transaccion`);
        const snapshot = await get(transRef);
        
        if (!snapshot.exists()) {
            return null;
        }
        
        return snapshot.val();
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return null;
    }
}

// Enhanced statement generation
function generarExtracto(transaccionesData, year, month) {
    const tbody = document.querySelector("#tabla-transacciones tbody");
    tbody.innerHTML = '';
    
    if (!transaccionesData) {
        mostrarMensajeSinTransacciones();
        return;
    }

    // Process and filter transactions
    const transacciones = processTransactions(transaccionesData, year, month);
    
    // Update statement title
    updateStatementTitle(year, month);
    
    // Display transactions or "no data" message
    if (transacciones.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-3">
                    No se encontraron transacciones para este período
                </td>
            </tr>
        `;
        return;
    }

    // Add transactions to table
    transacciones.forEach(trans => {
        const row = document.createElement("tr");
        row.className = "transaction-row";
        row.innerHTML = `
            <td>${formatearFecha(trans.fecha)}</td>
            <td>${trans.referencia}</td>
            <td>${trans.tipo}</td>
            <td>${trans.descripcion}</td>
            <td class="${getAmountClass(trans.cantidad)}">
                ${formatCurrency(trans.cantidad)}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Process and filter transactions
function processTransactions(transaccionesData, year, month) {
    return Object.entries(transaccionesData)
        .map(([ref, trans]) => ({
            referencia: ref,
            cantidad: parseFloat(trans.cantidad) || 0,
            descripcion: trans.descripcion || 'Sin descripción',
            fecha: trans.fecha || 'N/A',
            tipo: trans.tipo || 'Sin tipo'
        }))
        .filter(trans => {
            if (!trans.fecha || trans.fecha === 'N/A') return false;
            
            // Improved date parsing that handles both "13/06/2025, 20:18:11" and "13/06/25" formats
            const dateParts = trans.fecha.split(',')[0].trim().split('/');
            const day = parseInt(dateParts[0]);
            const monthTrans = parseInt(dateParts[1]);
            let yearTrans = parseInt(dateParts[2]);
            
            // Handle two-digit years
            if (yearTrans < 100) {
                yearTrans += 2000;
            }
            
            return yearTrans === year && monthTrans === month;
        })
        .sort((a, b) => {
            // More reliable date sorting
            const dateA = parseDateString(a.fecha);
            const dateB = parseDateString(b.fecha);
            return dateB - dateA; // Newest first
        });
}

// Improved date parsing
function parseDateString(dateStr) {
    if (!dateStr || dateStr === 'N/A') return new Date(0); // Epoch if invalid
    
    // Handle "13/06/2025, 20:18:11" format
    const [datePart, timePart] = dateStr.split(',');
    const [day, month, year] = datePart.trim().split('/').map(Number);
    
    if (timePart) {
        const [hours, minutes, seconds] = timePart.trim().split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
    }
    
    return new Date(year, month - 1, day);
}

// Update statement title with month/year
function updateStatementTitle(year, month) {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                       "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    document.getElementById("extracto-title").textContent = 
        `Extracto Bancario - ${monthNames[month - 1]} ${year}`;
}

// Improved date formatting
function formatearFecha(fechaStr) {
    if (!fechaStr || fechaStr === 'N/A') return 'N/A';
    
    // Handle both "13/06/2025" and "13/06/2025, 20:18:11" formats
    const [datePart] = fechaStr.split(',');
    const [day, month, year] = datePart.trim().split('/');
    
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

// Improved currency formatting
function formatCurrency(amount) {
    const formatted = Math.abs(amount).toLocaleString('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return `${amount >= 0 ? '+' : '-'}$${formatted}`;
}

// Get CSS class for amount based on value
function getAmountClass(amount) {
    return amount >= 0 ? 'text-success' : 'text-danger';
}

// Setup filter form with debounce
function setupFilterForm(transaccionesData) {
    const form = document.getElementById("filter-form");
    let timeoutId;
    
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Debounce to prevent rapid firing
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const year = parseInt(document.getElementById("year").value);
            const month = parseInt(document.getElementById("month").value);
            
            if (isNaN(year) || isNaN(month)) {
                mostrarError("Por favor seleccione un año y mes válidos");
                return;
            }
            
            generarExtracto(transaccionesData, year, month);
        }, 300);
    });
}

function mostrarMensajeSinTransacciones() {
    const tbody = document.querySelector("#tabla-transacciones tbody");
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-3">
                No se encontraron transacciones para este usuario
            </td>
        </tr>
    `;
}

// Replace the mostrarError function with this more robust version:
function mostrarError(mensaje) {
    try {
        // Try multiple possible containers
        const container = document.querySelector(".container") || 
                         document.querySelector("main") || 
                         document.body;
        
        if (!container) {
            console.error("Error:", mensaje);
            alert(mensaje); // Fallback to alert if no container found
            return;
        }

        const errorDiv = document.createElement("div");
        errorDiv.className = "alert alert-danger alert-dismissible fade show";
        errorDiv.role = "alert";
        errorDiv.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insert at the top of the container
        container.insertBefore(errorDiv, container.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            errorDiv.classList.remove("show");
            setTimeout(() => errorDiv.remove(), 150);
        }, 5000);
    } catch (e) {
        console.error("Error showing error message:", e);
        alert(mensaje); // Ultimate fallback
    }
}