import { database, ref, set, get} from '../login/firebase.js'

document.addEventListener("DOMContentLoaded", ()=>{
    const userDatos = JSON.parse(sessionStorage.getItem("userData"));

    if (!userDatos) {
        window.location.href = "/login/login.html";
        return;
    }
})