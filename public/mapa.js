let map = null;
let markerLayer = null;

// 🔥 referencias globales para sincronización
window._markers = [];
window._markerIndexMap = new Map();

/* =========================
   INICIALIZAR MAPA
========================= */
export function initMap() {

  if (map) return map;

  // Permitimos un zoom máximo de 22 para ver desplazamientos milimétricos
  map = L.map("mapa", {
    maxZoom: 22
  }).setView([0, 0], 15);

  window.mapInstance = map;

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxNativeZoom: 19, // Las imágenes reales llegan a 19
    maxZoom: 22        // Leaflet estirará las imágenes hasta 22
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);

  console.log("🗺️ Mapa inicializado");

  // Agregar Controles de Modo dentro del Mapa
  const ControlModos = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function () {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
      // Estilos movidos a CSS
      const createBtn = (id, text, title) => {
        const btn = L.DomUtil.create('button', '', container);
        btn.id = id;
        btn.innerHTML = text;
        btn.title = title;
        btn.classList.add('map-control-btn'); // Nueva clase CSS
        return btn;
      };

      createBtn('btn-modo-levantamiento', '🏠', 'Modo Levantamiento');
      createBtn('btn-modo-poligono', 'polygon', 'Modo Polígono');
      createBtn('btn-modo-replanteo', '📍', 'Modo Replanteo');

      return container;
    }
  });

  map.addControl(new ControlModos());

  return map;
}

/* =========================
   CARGAR PUNTOS EN MAPA (PRO)
========================= */
export function cargarPuntosEnMapa(puntos = []) {

  if (!map) {
    console.warn("Mapa no inicializado");
    return;
  }

  // limpiar anteriores
  markerLayer.clearLayers();
  window._markers = [];
  window._markerIndexMap.clear();

  puntos.forEach((p, index) => {

    const lat = parseFloat(p.latitud);
    const lng = parseFloat(p.longitud);

    if (isNaN(lat) || isNaN(lng)) return;

    // Usar circleMarker para puntos de levantamiento (Azules y más pequeños)
    const marker = L.circleMarker([lat, lng], {
      radius: 5,
      fillColor: "#3388ff",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(markerLayer);

    marker.bindPopup(`
      <b>Punto ${index + 1}</b><br>
      Lat: ${lat}<br>
      Lon: ${lng}<br>
      Desc: ${p.descripcion || 'N/A'}
    `);

    // 🔥 CLICK EN MARCADOR → resalta fila
    marker.on("click", () => {
      seleccionarFila(index);
    });

    window._markers.push(marker);
    window._markerIndexMap.set(index, marker);
  });

  // zoom automático
  if (puntos.length > 0) {

    const last = puntos[puntos.length - 1];

    const lat = parseFloat(last.latitud);
    const lng = parseFloat(last.longitud);

    if (!isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], 18);
    }
  }
}

/* =========================
   CENTRAR MAPA
========================= */
export function centrarEnGPS(lat, lng) {
  if (!map) return;

  map.setView([parseFloat(lat), parseFloat(lng)], 18);
}

/* =========================
   LIMPIAR MAPA
========================= */
export function limpiarMapa() {
  if (markerLayer) {
    markerLayer.clearLayers();
  }
}

/* =========================
   SINCRONIZACIÓN TABLA → MAPA
========================= */
export function seleccionarFila(index) {

  const filas = document.querySelectorAll("#tabla-puntos tbody tr");

  filas.forEach(f => f.classList.remove("fila-activa"));

  const fila = filas[index];

  if (fila) {
    fila.classList.add("fila-activa");

    fila.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}