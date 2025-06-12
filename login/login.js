import { database, ref, set, get, child } from 'login.js';

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
};

window.login = async function () {
  const idNumber = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const dbRef = ref(database);

  try {
    const snapshot = await get(child(dbRef, `users/${idNumber}`));

    if (snapshot.exists()) {
      const user = snapshot.val();
      if (user.password === password) {
        document.getElementById('login-status').innerText = "Inicio de sesión exitoso.";
        
      } else {
        document.getElementById('login-status').innerText = "Contraseña incorrecta.";
      }
    } else {
      document.getElementById('login-status').innerText = "Usuario no encontrado.";
    }
  } catch (error) {
    document.getElementById('login-status').innerText = "Error: " + error.message;
  }
};
