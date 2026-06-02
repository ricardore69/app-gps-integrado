import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"; // Importar Firebase Auth
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"; // Importar Firestore
import { auth, db } from "./conexion.js"; // Importar la configuración de Firebase

// Asegurar el foco al cargar la página en Electron
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-email")?.focus();
});

// Cambiar entre pestañas
document.getElementById("tab-login").addEventListener("click", () => {
  document.getElementById("form-login").style.display = "flex";
  document.getElementById("form-register").style.display = "none";
  document.getElementById("tab-login").classList.add("active");
  document.getElementById("tab-register").classList.remove("active");
}); // Cambiar a la pestaña de registro

document.getElementById("tab-register").addEventListener("click", () => {
  document.getElementById("form-login").style.display = "none";
  document.getElementById("form-register").style.display = "flex";
  document.getElementById("tab-login").classList.remove("active");
  document.getElementById("tab-register").classList.add("active");
});

// Registro de usuario
document.getElementById("btn-register").addEventListener("click", async () => {
  const nombre = document.getElementById("register-nombre").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value.trim();

  if (!nombre || !email || !password) {
    document.getElementById("mensaje").textContent =
      "Por favor completa todos los campos.";
    return;
  } // Validar formato de email

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    ); // Crear usuario con email y contraseña
    const user = userCredential.user;

    await setDoc(doc(db, "usuarios", user.uid), {
      usuarioId: user.uid,
      nombre: nombre,
      email: email,
      creado: new Date().toISOString(),
    });

    localStorage.removeItem("levantamientoActivo"); // Limpiar levantamiento activo

    document.getElementById("mensaje").textContent =
      "Usuario registrado con éxito.";
    window.location.href = "inicio.html";
  } catch (error) {
    console.error("Error al registrar:", error);
    document.getElementById("mensaje").textContent =
      "Error al registrar: " + error.message;
  }
});

// Inicio de sesión
document.getElementById("btn-login").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) {
    document.getElementById("mensaje").textContent =
      "Por favor, ingresa tu correo y contraseña.";
    return;
  } // Validar formato de email

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    ); // Iniciar sesión con email y contraseña
    const user = userCredential.user;

    localStorage.removeItem("levantamientoActivo"); // Limpiar levantamiento activo

    document.getElementById("mensaje").textContent =
      "Inicio de sesión exitoso.";
    window.location.href = "inicio.html";
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    let mensajeAmigable = "Error al iniciar sesión.";

    if (error.code === "auth/invalid-credential") {
      mensajeAmigable = "Correo o contraseña incorrectos.";
    }

    document.getElementById("mensaje").textContent = mensajeAmigable;
  }
});
