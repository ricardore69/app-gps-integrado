# Documentación técnica – conexion.js

## 📌 Propósito del módulo
El archivo `conexion.js` inicializa Firebase dentro de la aplicación GeoZapp.  
Desde aquí se configuran y exponen los servicios principales:

- Autenticación (Auth)
- Base de datos Firestore
- Inicialización general de Firebase

Este módulo actúa como punto central de conexión entre la app y Firebase, permitiendo que otros archivos importen `auth`, `db` o `app` sin repetir configuración.

---

## 📁 Ubicación
public/conexion.js

---

## 🔧 Dependencias utilizadas
El módulo importa Firebase desde CDN:

- initializeApp → Inicializa Firebase
- getAuth → Maneja autenticación
- getFirestore → Acceso a Firestore

---

## 🧩 Código del módulo

```js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyARWC5Tp6mR9FnLdGr4-2I37wAbDOCfM9I",
  authDomain: "proyectogps3070033.firebaseapp.com",
  projectId: "proyectogps3070033",
  storageBucket: "proyectogps3070033.appspot.com",
  messagingSenderId: "655380394634",
  appId: "1:655380394634:web:c577c70f092c1f6c05b373",
  measurementId: "G-TEPTKTVE2C",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Exportar para uso en otros archivos
export { app, auth, db };
