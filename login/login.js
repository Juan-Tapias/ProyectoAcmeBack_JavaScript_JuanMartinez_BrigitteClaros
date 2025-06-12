import { database, ref, set, get, child } from './firebase.js';

// Selección de elementos
const authCard = document.getElementById('auth-card');
const loginForm = document.getElementById('login');
const signupForm = document.getElementById('signup');

const ANIMATION_DURATION = 600; 

function toggleAuth(formToShow) {
  if (!authCard || !loginForm || !signupForm) {
    console.error('Elementos del formulario no encontrados');
    return;
  }

  authCard.classList.add('flipping');


  setTimeout(() => {
    loginForm.classList.remove('active');
    signupForm.classList.remove('active');
    
    if (formToShow === 'login') {
      loginForm.classList.add('active');
    } else {
      signupForm.classList.add('active');
      setTimeout(() => document.querySelector('#signup-id-type')?.focus(), 50);
    }
    
    authCard.classList.remove('flipping');
    
  
    document.getElementById('login-status').textContent = '';
    document.getElementById('signup-status').textContent = '';
  }, ANIMATION_DURATION / 2);
}

function setupAuthToggleListeners() {
  document.querySelector('#login .toggle-auth span')?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuth('signup');
  });
  
  document.querySelector('#signup .toggle-auth span')?.addEventListener('click', (e) => {
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


  const dbRef = ref(database);

  const snapshot = await get(child(dbRef, `users/${idNumber}`));
  
  if (snapshot.exists()) {
    const user = snapshot.val();
    if (user.idNumber === idNumber) {
      document.getElementById('signup-status').innerText = "Documento en uso";
    }}else if (!idType || !idNumber || !name || !lastname || !gender || !phone || !email || !address || !city || !password) {
    document.getElementById('signup-status').innerText = "Todos los campos son obligatorios.";
    return;
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
      password
    };
  
    try {
      await set(ref(database, 'users/' + idNumber), userData);
      document.getElementById('signup-status').innerText = "Cuenta creada exitosamente.";
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
      } else if (user.password === password) {
        document.getElementById('login-status').innerText = "Inicio de sesión exitoso.";
        window.location.href = "index.html";
      }else {
        document.getElementById('login-status').innerText = "Contraseña incorrecta.";
      }
    } else {
      document.getElementById('login-status').innerText = "Usuario no encontrado.";
    }
  } catch (error) {
    document.getElementById('login-status').innerText = "Error: " + error.message;
  }
    idNumber.value = ""
    password.value = ""
};
