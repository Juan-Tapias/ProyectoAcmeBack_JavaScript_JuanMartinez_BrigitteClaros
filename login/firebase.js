// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCc_eB8-IqjM_aqFAW9KyQ1tmGdH3jKHds",
  authDomain: "webpage-2f54f.firebaseapp.com",
  databaseURL: "https://webpage-2f54f-default-rtdb.firebaseio.com",
  projectId: "webpage-2f54f",
  storageBucket: "webpage-2f54f.appspot.com",
  messagingSenderId: "185571362985",
  appId: "1:185571362985:web:9c941e3e0ab05a2afb41b8",
  measurementId: "G-QV8RZQWH12"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, get, child };
