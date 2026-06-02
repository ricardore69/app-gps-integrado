// Variables globales para limpiar correctamente
let marcadorObjetivo = null;
let marcadorActual = null;
let lineaDistancia = null;
let puntoObjetivoActual = null;

// Función para limpiar el estado anterior de replanteo
export function limpiarReplanteo() {
  const map = window.mapInstance; // Obtener la instancia del mapa aquí
  puntoObjetivoActual = null;

  if (marcadorObjetivo) {
    map.removeLayer(marcadorObjetivo);
    marcadorObjetivo = null;
  }
  if (marcadorActual) {
    map.removeLayer(marcadorActual);
    marcadorActual = null;
  }
  if (lineaDistancia) {
    map.removeLayer(lineaDistancia);
    lineaDistancia = null;
  }
  const div = document.getElementById("distancia-replanteo");
  if (div) div.remove();
}

// Nueva función para establecer el objetivo desde la tabla
export function setPuntoObjetivoReplanteo(coords) {
  const map = window.mapInstance;
  limpiarReplanteo();
  puntoObjetivoActual = coords;

  marcadorObjetivo = L.marker(coords, {
    icon: L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
      iconSize: [25, 35],
    }),
  }).addTo(map).bindPopup("🎯 Objetivo");

  alert("Objetivo fijado. Use el GPS para acercarse.");
  console.log("Objetivo de replanteo fijado:", coords);
}

// Función principal llamada por levantamiento.js con datos del COM4
export function procesarGpsEnReplanteo(lat, lng) {
  if (!puntoObjetivoActual || !window.mapInstance) return;

  const map = window.mapInstance;
  // console.log("procesarGpsEnReplanteo: Recibiendo GPS:", { lat, lng }, "Objetivo:", puntoObjetivoActual);

  const posicionActual = [lat, lng];

  // Actualiza marcador de posición actual
  if (marcadorActual) {
    marcadorActual.setLatLng(posicionActual);
  } else {
    marcadorActual = L.marker(posicionActual, {
      icon: L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png", // Icono de punto de posición
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      }),
    }).addTo(map).bindPopup("📍 Mi Posición");
  }

  // Línea
  if (lineaDistancia) {
    lineaDistancia.setLatLngs([posicionActual, puntoObjetivoActual]);
  } else {
    lineaDistancia = L.polyline([posicionActual, puntoObjetivoActual], {
      color: "red",
      weight: 3,
      opacity: 0.8,
      dashArray: "6, 6",
    }).addTo(map); // Añadir al mapa
  }

  const distancia = calcularDistancia(posicionActual, puntoObjetivoActual);
  const rumbo = calcularRumbo(posicionActual, puntoObjetivoActual);
  actualizarPanelDistancia(distancia, rumbo);

  if (distancia <= 0.02) {
    alert("¡Has llegado al punto objetivo!");
    puntoObjetivoActual = null;
  }
}

function actualizarPanelDistancia(distancia, rumbo) {
  let div = document.getElementById("distancia-replanteo");
  if (!div) {
    div = document.createElement("div");
    div.id = "distancia-replanteo";
    div.className = "panel-info-flotante";
    document.getElementById("mapa").appendChild(div);
  }
  div.innerHTML = `
    <div style="font-size: 1.2rem;">Distancia: <b>${distancia.toFixed(3)} m</b></div>
    <div style="font-size: 0.9rem; color: #ffeb3b;">Azimut: ${rumbo.toFixed(1)}°</div>
  `;
}

// Iniciar replanteo con punto objetivo
export async function iniciarReplanteo() {
  alert("Seleccione un punto en la columna '✔' de la tabla para fijar el objetivo.");
}

function calcularDistancia(pos1, pos2) {
  const R = 6371e3; // metros
  const φ1 = (pos1[0] * Math.PI) / 180;
  const φ2 = (pos2[0] * Math.PI) / 180;
  const Δφ = ((pos2[0] - pos1[0]) * Math.PI) / 180;
  const Δλ = ((pos2[1] - pos1[1]) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function calcularRumbo(pos1, pos2) {
  const φ1 = (pos1[0] * Math.PI) / 180;
  const φ2 = (pos2[0] * Math.PI) / 180;
  const Δλ = ((pos2[1] - pos1[1]) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  let θ = Math.atan2(y, x);
  θ = ((θ * 180) / Math.PI + 360) % 360; // Convierte a grados de 0 a 360
  return θ;
}
