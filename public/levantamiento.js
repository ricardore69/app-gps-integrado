import { auth, db } from "./conexion.js";
import { cargarPuntosEnMapa, initMap } from "./mapa.js";
import { resetPoligono, setPuntosPoligono } from "./poligonos.js";
import { procesarGpsEnReplanteo, setPuntoObjetivoReplanteo, limpiarReplanteo, iniciarReplanteo } from "./replanteo.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const params = new URLSearchParams(window.location.search);
let levantamientoId = params.get("id");
let modoAccion = params.get("accion") || "levantamiento";

let usuarioId = null;
let puntosSeleccionados = [];
let isGpsConnected = false; // Nuevo: Estado de conexión del GPS
let gpsConfigurado = false; // Control de duplicidad de listeners
let puntoIdEnEdicion = null; // ID del punto que se está editando
let mapaCentradoInicial = false; // Control para centrar el mapa solo la primera vez
let gpsMarker = null; // Declaración formal del marcador
let notificationTimeout; // Para controlar el tiempo de las notificaciones

let bluetoothDevice = null;
let bluetoothCharacteristic = null;
let nmeaBuffer = ""; // Buffer para reconstruir sentencias NMEA

/* =========================
   INICIO
========================= */
window.addEventListener("DOMContentLoaded", async () => {

  initMap();

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    usuarioId = user.uid;

    if (!levantamientoId) {
      // 🔍 BUSCAR RESPALDO: Si no hay ID en la URL, buscar en la memoria del celular
      const respaldo = localStorage.getItem("levantamientoActivo");
      if (respaldo) {
        const datos = JSON.parse(respaldo);
        levantamientoId = datos.id;
        console.log("Reutilizando levantamiento de la memoria:", levantamientoId);
      } else {
        mostrarNotificacion("Redirigiendo: selecciona un levantamiento", "error");
        setTimeout(() => {
          window.location.href = "inicio.html";
        }, 2000);
        return;
      }
    }

    cargarPuntos(usuarioId, levantamientoId);
    actualizarUIPorModo();
    actualizarListaPuertos();
    configurarGPS();
    configurarControlesMapa();
  });

  // 🔥 CONECTAR BOTONES FUERA DEL AUTH PARA EVITAR DUPLICADOS
  document.getElementById("guardar")?.addEventListener("click", guardarPunto);

  document.getElementById("regresar")?.addEventListener("click", () => {
    // Avisamos que queremos cambiar de proyecto para que no nos auto-redirija de vuelta
    window.location.href = "inicio.html?cambiar=true";
  });

  document.getElementById("limpiar")?.addEventListener("click", () => {
    puntosSeleccionados = [];
    puntoIdEnEdicion = null;
    mapaCentradoInicial = false;

    const btnGuardar = document.getElementById("guardar");
    if (btnGuardar) btnGuardar.textContent = "Guardar";

    ["latitud", "longitud", "descripcion", "satelites", "precision"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    limpiarReplanteo();
    resetPoligono();
    document.querySelectorAll(".seleccionar").forEach((btn) => {
      btn.style.backgroundColor = "";
    });
    const divArea = document.getElementById("area");
    const divPerimetro = document.getElementById("perimetro");
    if (divArea) divArea.textContent = "Área: ---";
    if (divPerimetro) divPerimetro.textContent = "Perímetro: ---";
  });

  document.getElementById("btn-logout")?.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  });

  document.getElementById("btn-exportar")?.addEventListener("click", exportarACV);
});

async function actualizarListaPuertos() {
  const select = document.getElementById("select-puerto");
  if (!select || !window.gpsElectron.getPuertos) return;

  try {
    const puertos = await window.gpsElectron.getPuertos();
    select.innerHTML = "";

    puertos.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.path;
      opt.textContent = p.path + (p.friendlyName ? ` (${p.friendlyName})` : "");
      if (p.path === "COM4") opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener("change", (e) => {
      window.gpsElectron.cambiarPuerto(e.target.value);
    });
  } catch (err) { console.error("Error listando puertos:", err); }
}

function actualizarUIPorModo() {
  const tituloAccion = document.querySelector("h1");
  if (tituloAccion) tituloAccion.textContent = `geoZapp - ${modoAccion.toUpperCase()}`;

  const formContainer = document.getElementById("formulario-container");
  const medidasPoligono = document.getElementById("medidas-poligono");

  if (modoAccion === "replanteo") {
    formContainer.style.display = "none";
    medidasPoligono.style.display = "none";
  } else if (modoAccion === "poligono") {
    formContainer.style.display = "none";
    medidasPoligono.style.display = "block";
  } else {
    formContainer.style.display = "block";
    medidasPoligono.style.display = "none";
  }
}

function configurarControlesMapa() {
  document.getElementById('btn-modo-levantamiento')?.addEventListener('click', () => {
    modoAccion = 'levantamiento';
    actualizarUIPorModo();
  });
  document.getElementById('btn-modo-poligono')?.addEventListener('click', () => {
    modoAccion = 'poligono';
    actualizarUIPorModo();
  });
  document.getElementById('btn-modo-replanteo')?.addEventListener('click', () => {
    modoAccion = 'replanteo';
    actualizarUIPorModo();
    iniciarReplanteo();
  });
}

/* =========================
   GPS
========================= */
async function configurarGPS() {
  if (gpsConfigurado) return; // Si ya hay listeners, no agregamos más
  gpsConfigurado = true;

  // MODO CELULAR (Browser)
  if (!window.gpsElectron) {
    console.log("📱 Modo Navegador detectado");
    mostrarBotonBluetooth();
  } else {
    // MODO PC (Electron)
    console.log("💻 Modo Electron detectado");
    // Pedir estado inicial al cargar la página para evitar bloqueo por isGpsConnected = false
    if (window.gpsElectron.getGpsEstado) {
      const estadoInicial = await window.gpsElectron.getGpsEstado();
      console.log("Estado GPS inicial al cargar la página:", estadoInicial);
      actualizarInterfazEstado(estadoInicial);
    }

    // Escuchar cambios de estado de conexión
    window.gpsElectron.onEstado?.((estado) => {
      actualizarInterfazEstado(estado);
    });

    // Escuchar NMEA crudo para depuración visual en la consola (Ctrl+Shift+I)
    window.gpsElectron.onNmeaRaw?.((linea) => {
      console.log("🛰️ NMEA RAW:", linea);
    });

    window.gpsElectron.onCoordenadas((data) => {
      procesarDatosEntradaGps(data);
    });
  }
}

/**
 * Función unificada para procesar coordenadas (vengan de Serial o Bluetooth)
 */
function procesarDatosEntradaGps(data) {
  if (!isGpsConnected) return;

  try {
    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    const fix = data.fix;

    const fixLabels = { 1: "GPS (SPS)", 2: "DGPS 📡", 3: "PPS Fix", 4: "RTK Fixed 🚀", 5: "RTK Float 🛰️" };
    const statusDiv = document.getElementById("gps-status");
    if (statusDiv) {
      const fixTexto = fixLabels[fix] || `Fix: ${fix}`;
      statusDiv.textContent = `Estado GPS: ✅ Conectado (${fixTexto})`;
      statusDiv.style.color = (fix === 4) ? "#00bcd4" : (fix === 5 ? "#ff9800" : "green");
    }

    if (!puntoIdEnEdicion) {
      const inputsAuto = ["latitud", "longitud", "satelites", "precision"];
      inputsAuto.forEach(id => {
        const el = document.getElementById(id);
        if (el && document.activeElement !== el) {
          const val = id === "latitud" ? data.latitude : (id === "longitud" ? data.longitude : data[id]);
          el.value = val ?? "";
        }
      });
    }

    const latSpan = document.getElementById("lat");
    const lonSpan = document.getElementById("lon");
    if (latSpan) latSpan.textContent = data.latitude ?? "--";
    if (lonSpan) lonSpan.textContent = data.longitude ?? "--";

    if (window.mapInstance && !isNaN(lat) && !isNaN(lng)) {
      const coords = [lat, lng];
      if (!mapaCentradoInicial) {
        window.mapInstance.setView(coords, 18);
        mapaCentradoInicial = true;
      } else {
        window.mapInstance.panTo(coords);
      }

      if (!gpsMarker) {
        gpsMarker = L.circleMarker(coords, { radius: 8, fillColor: "red", color: "white", weight: 2, opacity: 1, fillOpacity: 0.9 }).addTo(window.mapInstance);
      } else {
        gpsMarker.setLatLng(coords);
      }
    }

    if (modoAccion === "replanteo") {
      procesarGpsEnReplanteo(lat, lng);
    }
  } catch (e) {
    console.error("Error al procesar datos GPS:", e);
  }
}

/* =========================
   WEB BLUETOOTH (CELULAR)
========================= */
function mostrarBotonBluetooth() {
  const statusDiv = document.getElementById("gps-status");
  if (statusDiv) {
    statusDiv.innerHTML = `
      <button id="btn-conectar-bt" style="padding: 10px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
      <button id="btn-conectar-bt" type="button" style="padding: 10px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
        🔵 Conectar GPS Bluetooth
      </button>`;
    document.getElementById("btn-conectar-bt")?.addEventListener("click", conectarBluetooth);
  }
}

async function conectarBluetooth() {
  try {
    if (!levantamientoId) {
      mostrarNotificacion("Error: No hay un levantamiento activo para vincular.", "error");
      return;
    }

    console.log("Buscando GPS Bluetooth...");
    // Filtro estándar para SPP (Serial Port Profile)
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['00001101-0000-1000-8000-00805f9b34fb'] }],
      optionalServices: ['00001101-0000-1000-8000-00805f9b34fb']
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('00001101-0000-1000-8000-00805f9b34fb');
    const characteristic = await service.getCharacteristic('00001101-0000-1000-8000-00805f9b34fb');

    bluetoothCharacteristic = characteristic;
    await characteristic.startNotifications();

    characteristic.addEventListener('characteristicvaluechanged', (event) => {
      const decoder = new TextDecoder();
      const text = decoder.decode(event.target.value);
      nmeaBuffer += text;

      // Procesar línea por línea
      let lineas = nmeaBuffer.split(/\r?\n/);
      nmeaBuffer = lineas.pop(); // Mantener el fragmento incompleto

      lineas.forEach(linea => {
        if (linea.includes("GGA")) {
          const data = parsearGgaManual(linea);
          if (data) procesarDatosEntradaGps(data);
        }
      });
    });

    isGpsConnected = true;
    actualizarInterfazEstado({ conectado: true, mensaje: "Bluetooth OK" });
    console.log("✅ GPS Bluetooth conectado");

  } catch (error) {
    console.error("Error Bluetooth:", error);
    alert("No se pudo conectar: " + error.message);
  }
}

/**
 * Parser simple de sentencias GGA para el navegador
 */
function parsearGgaManual(linea) {
  const p = linea.split(",");
  if (p.length < 10) return null;

  const lat = convertirNmeaADecimal(p[2], p[3]);
  const lon = convertirNmeaADecimal(p[4], p[5]);
  const fix = parseInt(p[6] || "0");
  const sats = parseInt(p[7] || "0");
  const prec = parseFloat(p[8] || "0");

  if (!lat || !lon) return null;

  return {
    latitude: lat,
    longitude: lon,
    satelites: sats,
    precision: prec,
    fix: fix
  };
}

function convertirNmeaADecimal(valor, dir) {
  if (!valor || valor.length < 4) return null;
  const dot = valor.indexOf(".");
  const deg = parseInt(valor.slice(0, dot - 2));
  const min = parseFloat(valor.slice(dot - 2));
  let dec = deg + (min / 60);
  if (dir === 'S' || dir === 'W') dec *= -1;
  return parseFloat(dec.toFixed(8));
}

function actualizarInterfazEstado(estado) {
  console.log("Actualizando estado GPS en interfaz:", estado);
  const statusDiv = document.getElementById("gps-status");
  isGpsConnected = estado.conectado;
  if (statusDiv) {
    statusDiv.textContent = `Estado GPS: ${estado.conectado ? '✅ Conectado' : '❌ ' + (estado.error || estado.mensaje || 'Desconectado')}`;
    statusDiv.style.color = estado.conectado ? "green" : "red";
  }
}

/**
 * Muestra avisos visuales en pantalla
 */
function mostrarNotificacion(mensaje, tipo = "info") {
  console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
  const notif = document.createElement("div");
  notif.style.position = "fixed";
  notif.style.top = "20px";
  notif.style.right = "20px";
  notif.style.padding = "10px 20px";
  notif.style.borderRadius = "5px";
  notif.style.color = "white";
  notif.style.backgroundColor = tipo === "error" ? "#f44336" : "#2196F3";
  notif.style.zIndex = "9999";
  notif.textContent = mensaje;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

/* =========================
   CARGAR PUNTOS
========================= */
export async function cargarPuntos(usuarioId, levantamientoId) {
  try {
    const ref = collection(
      db,
      `usuarios/${usuarioId}/levantamientos/${levantamientoId}/puntos`
    );

    const q = query(ref, orderBy("timestamp", "asc"));
    const snap = await getDocs(q);

    const tabla = document.querySelector("#tabla-puntos tbody");
    if (!tabla) return;

    tabla.innerHTML = "";
    const puntos = [];
    let i = 1;

    if (snap.empty) {
      console.log("No hay puntos guardados en este levantamiento.");
    }

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const fila = tabla.insertRow();

      // 0. Punto
      fila.insertCell(0).textContent = i++;

      // 1. Latitud
      fila.insertCell(1).textContent = d.latitud ?? "";

      // 2. Longitud
      fila.insertCell(2).textContent = d.longitud ?? "";

      // 3. DESCRIPCIÓN ✔ (ESTA ES LA QUE TE FALTA VISUALMENTE)
      fila.insertCell(3).textContent = d.descripcion ?? "";

      // 4. Satélites
      fila.insertCell(4).textContent = d.satelites ?? "";

      // 5. Precisión
      fila.insertCell(5).textContent = d.precision ?? "";

      // 6. Fecha
      const fecha = d.timestamp?.toDate?.()
        ? d.timestamp.toDate().toLocaleString()
        : "";

      fila.insertCell(6).textContent = fecha;

      // 7. Seleccionar
      const btnSeleccionar = document.createElement("button");
      btnSeleccionar.textContent = "✔";
      btnSeleccionar.classList.add("seleccionar"); // Clase para que main.js y replanteo.js lo detecten
      btnSeleccionar.dataset.lat = d.latitud; // Datos para main.js y replanteo.js
      btnSeleccionar.dataset.lng = d.longitud;

      btnSeleccionar.addEventListener("click", (e) => {
        const lat = parseFloat(e.target.dataset.lat);
        const lng = parseFloat(e.target.dataset.lng);

        if (modoAccion === "replanteo") {
          // En modo replanteo solo se selecciona uno
          document.querySelectorAll(".seleccionar").forEach(b => b.style.backgroundColor = "");
          console.log("Seleccionando punto objetivo para replanteo:", [lat, lng]);
          e.target.style.backgroundColor = "#00bcd4";
          setPuntoObjetivoReplanteo([lat, lng]);
        } else {
          // Modo Polígono o Levantamiento (Selección múltiple)
          const yaSeleccionado = puntosSeleccionados.some(p => p[0] === lat && p[1] === lng);

          if (!yaSeleccionado) {
            puntosSeleccionados.push([lat, lng]);
            e.target.style.backgroundColor = "#0f0";
          } else {
            puntosSeleccionados = puntosSeleccionados.filter(p => !(p[0] === lat && p[1] === lng));
            e.target.style.backgroundColor = "";
          }
          if (typeof setPuntosPoligono === "function") {
            setPuntosPoligono(puntosSeleccionados);
          }
        }
      });
      fila.insertCell(7).appendChild(btnSeleccionar);

      // 8. Editar
      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️";
      btnEditar.classList.add("editar-punto"); // Clase para identificar el botón de editar
      btnEditar.dataset.id = docSnap.id; // ID del documento para editar
      btnEditar.dataset.lat = d.latitud;
      btnEditar.dataset.lng = d.longitud;
      btnEditar.dataset.desc = d.descripcion || "";
      btnEditar.dataset.sat = d.satelites || 0;
      btnEditar.dataset.prec = d.precision || 0;
      btnEditar.addEventListener("click", () => editarPunto(docSnap.id, d)); // Añadir listener
      fila.insertCell(8).appendChild(btnEditar);

      // 9. Eliminar
      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑";
      btnEliminar.classList.add("eliminar-punto"); // Clase para identificar el botón de eliminar
      btnEliminar.dataset.id = docSnap.id; // ID del documento para eliminar
      btnEliminar.addEventListener("click", () => eliminarPunto(docSnap.id)); // Añadir listener
      fila.insertCell(9).appendChild(btnEliminar);


      // =========================
      // MAPA
      // =========================
      // Asegurarse de que los puntos para el mapa también incluyan la descripción
      if (d.latitud && d.longitud) {
        puntos.push({
          latitud: parseFloat(d.latitud), // Asegurarse de que sean números
          longitud: parseFloat(d.longitud),
          descripcion: d.descripcion || "" // Incluir descripción para el popup del mapa
        });
      }
    });

    // 🔥 ENVIAR AL MAPA (AQUÍ SÍ)
    // La función cargarPuntosEnMapa ya maneja la limpieza de marcadores anteriores
    cargarPuntosEnMapa(puntos);
  } catch (err) {
    console.error("Error al cargar puntos:", err);
  }
}

/* =========================
   EXPORTAR DATOS
========================= */
async function exportarACV() {
  try {
    const ref = collection(db, `usuarios/${usuarioId}/levantamientos/${levantamientoId}/puntos`);
    const q = query(ref, orderBy("timestamp", "asc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      mostrarNotificacion("No hay puntos para exportar", "error");
      return;
    }

    let csvContent = "Punto,Latitud,Longitud,Descripcion,Satelites,Precision,Fecha\n";
    let i = 1;

    snap.forEach(docSnap => {
      const d = docSnap.data();
      const fecha = d.timestamp?.toDate().toISOString() || "";
      csvContent += `${i++},${d.latitud},${d.longitud},"${d.descripcion || ""}",${d.satelites || 0},${d.precision || 0},${fecha}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `levantamiento_${levantamientoId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Error al exportar:", err);
  }
}

/* =========================
   GUARDAR PUNTO (FIX TOTAL)
========================= */
async function guardarPunto() {

  console.log("🟡 Intentando guardar punto...");

  const lat = document.getElementById("latitud")?.value;
  const lon = document.getElementById("longitud")?.value;
  const sat = document.getElementById("satelites")?.value;
  const prec = document.getElementById("precision")?.value;
  const desc = document.getElementById("descripcion")?.value || "";

  console.log("📌 Datos:", { lat, lon, sat, prec });

  if (!lat || !lon) {
    alert("No hay coordenadas GPS");
    return;
  }

  if (!usuarioId || !levantamientoId) {
    alert("Falta usuario o levantamiento");
    return;
  }

  const punto = {
    latitud: parseFloat(lat),
    longitud: parseFloat(lon),
    descripcion: desc,
    satelites: sat ? parseInt(sat) : 0,
    precision: prec ? parseFloat(prec) : 0,
    timestamp: Timestamp.now()
  };


  try {

    if (puntoIdEnEdicion) {
      const ref = doc(db, `usuarios/${usuarioId}/levantamientos/${levantamientoId}/puntos`, puntoIdEnEdicion);
      await updateDoc(ref, punto);
      console.log("✅ Punto actualizado");

      // Resetear estado de edición
      puntoIdEnEdicion = null;
      const btnGuardar = document.getElementById("guardar");
      if (btnGuardar) btnGuardar.textContent = "Guardar";
    } else {
      const ref = collection(
        db,
        `usuarios/${usuarioId}/levantamientos/${levantamientoId}/puntos`
      );
      await addDoc(ref, punto);
      console.log("✅ Punto guardado");
    }

    cargarPuntos(usuarioId, levantamientoId);

    // Limpiar campos
    ["latitud", "longitud", "descripcion", "satelites", "precision"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

  } catch (err) {
    console.error("❌ Error guardando:", err);
  }
}

/* =========================
   EDITAR Y ELIMINAR (FIREBASE)
========================= */
function editarPunto(puntoId, datosPunto) {
  puntoIdEnEdicion = puntoId;

  console.log(`Cargando punto ${puntoId} para edición.`);

  // Cargar datos en el formulario
  document.getElementById("latitud").value = datosPunto.latitud ?? "";
  document.getElementById("longitud").value = datosPunto.longitud ?? "";
  document.getElementById("descripcion").value = datosPunto.descripcion ?? "";
  document.getElementById("satelites").value = datosPunto.satelites ?? "";
  document.getElementById("precision").value = datosPunto.precision ?? "";

  // Cambiar texto del botón para indicar que estamos en modo edición
  const btnGuardar = document.getElementById("guardar");
  if (btnGuardar) {
    btnGuardar.textContent = "Actualizar Punto";
  }

  // Desplazar la vista al formulario para que el usuario pueda editar
  document.getElementById("formulario-container")?.scrollIntoView({ behavior: "smooth" });
}

async function eliminarPunto(puntoId) {
  if (!confirm("¿Estás seguro de eliminar este punto?")) return;

  try {
    const ref = doc(db, `usuarios/${usuarioId}/levantamientos/${levantamientoId}/puntos`, puntoId);
    await deleteDoc(ref);
    console.log("Punto eliminado de Firestore.");
    cargarPuntos(usuarioId, levantamientoId);
  } catch (err) {
    console.error("❌ Error al eliminar:", err);
  }
}