import { database, ref, set, get, child, update } from './firebase.js';

const authCard = document.getElementById('auth-card');
const loginForm = document.getElementById('login');
const signupForm = document.getElementById('signup');
const recuperarForm = document.getElementById('recuperar');

const ANIMATION_DURATION = 600; 

async function encriptarContraseña(contraseña) {
  const encoder = new TextEncoder();
  const datos = encoder.encode(contraseña);
  const hashBuffer = await crypto.subtle.digest('SHA-256', datos);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function compararContraseña(contraseñaIngresada, contraseñaEncriptada) {
  
  const hash = await encriptarContraseña(contraseñaIngresada);
  return hash === contraseñaEncriptada;
}

document.getElementById("show-login").addEventListener("click", function () {
  toggleAuth('login');
});

document.getElementById("show-recuperar").addEventListener("click", function () {
  toggleAuth('recuperar');
});

function toggleAuth(formToShow) {
  if (!authCard || !loginForm || !signupForm) {
    console.error('Elementos del formulario no encontrados');
    return;
  }

  authCard.classList.add('flipping');


  setTimeout(() => {
    loginForm.classList.remove('active');
    signupForm.classList.remove('active');
    recuperarForm?.classList.remove('active');
    

    if (formToShow === 'login') {
      loginForm.classList.add('active');
    } else if (formToShow === 'signup') {
      signupForm.classList.add('active');
      setTimeout(() => document.querySelector('#signup-id-type')?.focus(), 50);
    } else if (formToShow === 'recuperar') {
      recuperarForm.classList.add('active');
    }
    authCard.classList.remove('flipping');
    
  
    document.getElementById('login-status').textContent = '';
    document.getElementById('signup-status').textContent = '';
  }, ANIMATION_DURATION / 2);
}

function setupAuthToggleListeners() {
  document.querySelector('#login .toggle-auth span')?.addEventListener('click', (e) => {
    if (e.target.textContent.includes("Regístrate")) {
      e.preventDefault();
      toggleAuth('signup');
    } else if (e.target.textContent.includes("Recuperar")) {
      e.preventDefault();
      toggleAuth('recuperar');
    }
  });

  document.querySelector('#signup .toggle-auth span')?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuth('login');
  });

  document.querySelector('#recuperar .toggle-auth span')?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuth('login');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupAuthToggleListeners();
});

export { toggleAuth };
window.toggleAuth = toggleAuth;

window.signup = async function () {
  const idType = document.getElementById('signup-id-type').value;
  const idNumber = document.getElementById('signup-id-number').value;
  const name = document.getElementById('signup-name').value;
  const lastname = document.getElementById('signup-lastname').value;
  const gender = document.getElementById('signup-gender').value;
  const phone = document.getElementById('signup-phone').value;
  const email = document.getElementById('signup-email').value;
  const address = document.getElementById('signup-address').value;
  const city = document.getElementById('signup-city').value;
  const password = document.getElementById('signup-password').value;


  const fecha = new Date();
  const opciones = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
  };

  const fechaFormateada = fecha.toLocaleString('es-ES', opciones);
  
  const numeroCuenta = `44185${Math.floor(1000 + Math.random() * 1936)}`;
  const dbRef = ref(database);

  const snapshot = await get(child(dbRef, `users/${idNumber}`));
  
  if (snapshot.exists()) {
    document.getElementById('signup-status').innerText = "Documento en uso. Verifique por favor.";
    return;
  }
  
  const allUsersSnapshot = await get(child(dbRef, 'users'));
  
  if (allUsersSnapshot.exists()) {
    const users = allUsersSnapshot.val();
    const emailExists = Object.values(users).some(user => user.email === email);
  
    if (emailExists) {
      document.getElementById('signup-status').innerText = "Correo en uso. Verifique por favor.";
      return;
    }
  } if (!idType || !idNumber || !name || !lastname || !gender || !phone || !email || !address || !city || !password) {
    document.getElementById('signup-status').innerText = "Todos los campos son obligatorios.";
  }else{
    const userData = {
      idType,
      idNumber,
      name,
      lastname,
      gender,
      phone,
      email,
      address,
      city,
      password,
      numeroCuenta,
      saldo: 0,
      fecha: fechaFormateada
    };
  
    try {
      userData.password = await encriptarContraseña(password);
      await set(ref(database, 'users/' + idNumber), userData);
      document.getElementById('signup-status').innerText = "Cuenta creada exitosamente.";
      ventana(numeroCuenta)
      document.getElementById('signup-id-number').value = "";
      document.getElementById('signup-name').value = "";
      document.getElementById('signup-lastname').value = "";
      document.getElementById('signup-gender').value = "";
      document.getElementById('signup-phone').value = "";
      document.getElementById('signup-email').value = "";
      document.getElementById('signup-address').value = "";
      document.getElementById('signup-city').value = "";
      document.getElementById('signup-password').value = "";
      document.getElementById('signup-id-type').value = "";
    } catch (error) {
      document.getElementById('signup-status').innerText = "Error: " + error.message;
    }
  }
};

window.login = async function () {
  const idType = document.getElementById('type-id').value;
  const idNumber = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const dbRef = ref(database);

  try {
    const snapshot = await get(child(dbRef, `users/${idNumber}`));


    if (snapshot.exists()) {
      const user = snapshot.val();
      if (user.idType !== idType) {
        document.getElementById('login-status').innerText = "Tipo de documento incorrecto.";
      } else if (compararContraseña(password, user.password)) {
        document.getElementById('login-status').innerText = "Inicio de sesión exitoso.";
        sessionStorage.setItem("userData", JSON.stringify(user));
        window.location.href = "/movimientos/movimientos.html";
      }else {
        document.getElementById('login-status').innerText = "Contraseña incorrecta.";
      }
    } else {
      document.getElementById('login-status').innerText = "Usuario no encontrado.";
    }
  } catch (error) {
    document.getElementById('login-status').innerText = "Error: " + error.message;
  }
};

window.recuperarPassword = async function () {
  const idType = document.getElementById('type-id-recuperar').value;
  const idNumber = document.getElementById('recuperar-id').value;
  const email = document.getElementById('recuperar-email').value;
  const statusEl = document.getElementById('recuperar-status');
  const ventana = document.getElementById("ventana-recuperar")

  statusEl.innerText = "";

  if (!idType || !idNumber || !email) {
    statusEl.innerText = "Por favor, completa todos los campos.";
    return;
  }

  const dbRef = ref(database);

    const snapshot = await get(child(dbRef, `users/${idNumber}`));


    if (snapshot.exists()) {
      const user = snapshot.val();

      if (user.idType !== idType) {
        statusEl.innerText = "Tipo de documento incorrecto.";
      } else if (user.email !== email) {
        statusEl.innerText = "El correo no coincide con nuestros registros.";
      } else if (user.idNumber !== idNumber){
        statusEl.innerText = "El numero de identificación no existe.";
      }
       else {
        statusEl.innerText = "Usuario verificado. Ingresa tu nueva contraseña.";
        if (ventana.style.display === "none" || ventana.style.display === ""){
          ventana.style.display = "flex"
            const html = `
            <div class="input-container" id="ventana-nueva">
            <input type="text" id="nueva-password" required>
            <label for="login-password" class="label">Nueva Contraseña</label>
            <div class="underline"></div>
          </div>
           <button onclick="changePass('${idNumber}')" id="btn-recuperar">Cambiar contraseña</button>
          `
          ventana.innerHTML = html;
          document.getElementById('type-id-recuperar').value = ""
          document.getElementById('recuperar-id').value = ""
          document.getElementById('recuperar-email').value = ""
        }
    }
    } else {
      statusEl.innerText = "Usuario no encontrado.";
    }
  };

function ventana(numero){
  const ventana = document.getElementById("ventana-login")
  if (ventana.style.display === "none" || ventana.style.display === ""){
    ventana.style.display = "flex"
    const html = `
    <div>
        <p>Bienvenido al BancoAcme</p>
        <p>Donde le coyote compra sus explosivos</p>
        <br>
        <p>Este es tu numero de cuenta bancaria: ${numero}</p>
        <br>
        <p>Fecha de creación: ${new Date().toLocaleDateString()}</p>
    </div>
    `
    ventana.innerHTML = html

    setTimeout(() => {
      ventana.style.display = "none";
      ventana.innerHTML = ""; 
    }, 5000);
  }
}

window.changePass = async function (idNumber) {
  let newPass = document.getElementById('nueva-password').value;
  const status = document.getElementById('recuperar-status'); 

  if (!newPass) {
    status.innerText = "Por favor ingresa la nueva contraseña.";
    return;
  }
    newPass = await encriptarContraseña(newPass);
    await update(ref(database, `users/${idNumber}`), {
      password: newPass
    });
    status.innerText = "Contraseña actualizada exitosamente.";

    const ventana = document.getElementById('ventana-recuperar');
    ventana.style.display = "none";
    ventana.innerHTML = "";
};
