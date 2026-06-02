import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyARWC5Tp6mR9FnLdGr4-2I37wAbDOCfM9I",
  authDomain: "proyectogps3070033.firebaseapp.com",
  projectId: "proyectogps3070033",
  storageBucket: "proyectogps3070033.firebaseapp.com",
  messagingSenderId: "655380394634",
  appId: "1:655380394634:web:c577c70f092c1f6c05b373",
  measurementId: "G-TEPTKTVE2C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Exportar para uso en otros archivos
export { app, auth, db };
