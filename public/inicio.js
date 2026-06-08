import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"; // Importar Firebase Auth
import {
  query,
  where,
  getDocs,
  doc,
  collection,
  addDoc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"; // Importar Firestore
import { auth, db } from "./conexion.js";

// Elementos del DOM
const spanUsuario = document.getElementById("nombre-usuario");
const inputLevantamiento = document.getElementById("inputLevantamiento");
const btnGuardar = document.getElementById("btnGuardarLevantamiento");
const mensajeLevantamiento = document.getElementById("mensajeLevantamiento");
const selectLevantamientos = document.getElementById("selectLevantamientos");
const nuevoLevantamientoForm = document.getElementById(
  "nuevoLevantamientoForm"
);

const params = new URLSearchParams(window.location.search);
const modoCambarProyecto = params.get("cambiar") === "true";

// Variables de estado
let usuarioActual = null;
let modoSeleccionado = "levantamiento"; // Modo por defecto
// Autenticación y carga de usuario
onAuthStateChanged(auth, async (user) => {
  spanUsuario.textContent = "";
  inputLevantamiento.value = "";
  mensajeLevantamiento.textContent = "";

  if (!user) {
    console.log("Usuario no autenticado, redirigiendo a login...");
    window.location.href = "login.html";
    return;
  } // Si el usuario no está autenticado, redirigir al login

  console.log("Usuario autenticado:", user.email);
  usuarioActual = user.uid;

  // 🚀 AUTO-REANUDAR: Si ya hay un levantamiento en memoria y no venimos a "cambiar"
  if (!modoCambarProyecto) {
    const respaldo = localStorage.getItem("levantamientoActivo");
    if (respaldo) {
      const datos = JSON.parse(respaldo);
      console.log("Reanudando levantamiento:", datos.nombre);
      window.location.href = `levantamiento.html?id=${datos.id}&accion=${modoSeleccionado}`;
      return;
    }
  }

  const docRef = doc(db, "usuarios", usuarioActual);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    console.log("Usuario autenticado pero sin datos en Firestore.");
    await setDoc(
      docRef,
      {
        usuarioId: usuarioActual,
        nombre: "Usuario desconocido",
        email: user.email,
        creado: new Date().toISOString(),
      },
      { merge: true }
    );
    spanUsuario.textContent = "Usuario desconocido";
    return;
  } // Si el usuario no tiene datos, crear un documento por defecto

  const data = docSnap.data();
  spanUsuario.textContent = data.nombre || "Sin nombre";

  // 🔽 Cargar levantamientos existentes
  const levantamientosRef = collection(
    db,
    `usuarios/${usuarioActual}/levantamientos`
  );
  const querySnapshot = await getDocs(levantamientosRef); // Obtener todos los levantamientos del usuario

  if (!querySnapshot.empty) {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = data.nombre;
      selectLevantamientos.appendChild(option);
    });
  } // Si hay levantamientos, agregarlos al selector
});

// 🚪 Función para Cerrar Sesión
document.getElementById("btn-logout")?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    console.log("Sesión cerrada con éxito");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});

// 🔄 Manejo del selector de levantamientos
selectLevantamientos.addEventListener("change", (e) => {
  const selected = e.target.value;

  if (selected === "nuevo") {
    nuevoLevantamientoForm.style.display = "block";
  } else if (selected) {
    // 💾 GUARDAR EN MEMORIA: Para que el celular recuerde qué levantamiento abriste
    const nombreSeleccionado = e.target.options[e.target.selectedIndex].text;
    localStorage.setItem(
      "levantamientoActivo",
      JSON.stringify({
        id: selected,
        nombre: nombreSeleccionado,
      })
    );
    mensajeLevantamiento.textContent = `Abriendo levantamiento en modo ${modoSeleccionado}...`;
    setTimeout(() => {
      window.location.href = `levantamiento.html?id=${selected}&accion=${modoSeleccionado}`;
    }, 1000);
  } else {
    nuevoLevantamientoForm.style.display = "none"; // Ocultar el formulario si estaba visible
  }
});

// Guardar nuevo levantamiento
btnGuardar?.addEventListener("click", async () => {
  const nombreLevantamiento = inputLevantamiento.value.trim();

  if (!nombreLevantamiento) {
    mensajeLevantamiento.textContent = "Por favor, escribe un nombre.";
    return;
  }

  try {
    const levantamientosRef = collection(
      db,
      `usuarios/${usuarioActual}/levantamientos`
    );

    const q = query(
      levantamientosRef,
      where("nombre_lower", "==", nombreLevantamiento.toLowerCase())
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docExistente = querySnapshot.docs[0];
      const levantamientoId = docExistente.id;

      mensajeLevantamiento.textContent =
        `Levantamiento existente, se cargarán los datos en modo ${modoSeleccionado}...`;
      setTimeout(() => {
        window.location.href = `levantamiento.html?id=${levantamientoId}&accion=${modoSeleccionado}`;
      }, 1000);
      return;
    } // Si ya existe un levantamiento con ese nombre, cargar sus datos

    const nuevoLevantamiento = await addDoc(levantamientosRef, {
      nombre: nombreLevantamiento,
      nombre_lower: nombreLevantamiento.toLowerCase(),
      fecha: new Date().toISOString(),
    }); // Crear un nuevo levantamiento en Firestore

    mensajeLevantamiento.textContent =
      "Levantamiento guardado correctamente con ID: " + nuevoLevantamiento.id;
    inputLevantamiento.value = "";

    localStorage.setItem(
      "levantamientoActivo",
      JSON.stringify({
        id: nuevoLevantamiento.id,
        nombre: nombreLevantamiento,
      })
    ); // Guardar el levantamiento activo en localStorage

    setTimeout(() => {
      window.location.href = `levantamiento.html?id=${nuevoLevantamiento.id}&accion=${modoSeleccionado}`;
    }, 1000);
  } catch (error) {
    console.error("Error al guardar levantamiento:", error);
    mensajeLevantamiento.textContent = "Error al guardar.";
  }
});
