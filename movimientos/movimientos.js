import { database, ref, get} from '../login/firebase.js'

document.addEventListener("DOMContentLoaded", async ()=>{
    const userDatos = JSON.parse(sessionStorage.getItem("userData"));
    const id = JSON.parse(sessionStorage.getItem("userData")).idNumber;
        const transRef = ref(database `users/${id}/transaccion`)
        const snapshot = await get(transRef);
        if (snapshot.exists()) {
            const transaccion = snapshot.val();

            const transaccionesOrdenadas = transaccion.sort((a, b) => {
        return new Date(b.fecha.split('/').reverse().join('-')) - new Date(a.fecha.split('/').reverse().join('-'));
    }).slice(0, 10);
        transaccionesOrdenadas.forEach(trans => {
        const fila = document.createElement("tr");
        
        fila.innerHTML = `
            <td>${trans.fecha}</td>
            <td>${trans.referencia}</td>
            <td>${trans.tipo}</td>
            <td>${trans.descripcion}</td>
            <td class="${trans.valor >= 0 ? 'positivo' : 'negativo'}">
                ${trans.valor >= 0 ? '+' : ''}${trans.valor.toFixed(2)}
            </td>
        `;
        
        tbody.appendChild(fila);
    });}
})