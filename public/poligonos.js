// No es necesario importar getMap, se usa window.mapInstance directamente

// =========================
// VARIABLES INTERNAS
// =========================
let puntosPoligono = [];
let poligonoActual = null;

/* =========================
   SET PUNTOS
========================= */
export function setPuntosPoligono(puntos) {
  puntosPoligono = puntos;
  dibujarPoligono();
}

/* =========================
   DIBUJAR POLÍGONO
========================= */
export function dibujarPoligono() { // Se accede a window.mapInstance directamente
  const map = window.mapInstance;

  if (!map) {
    console.warn("Mapa no inicializado");
    return;
  }

  if (puntosPoligono.length < 3) {
    resetPoligono();
    return;
  }

  // eliminar anterior
  if (poligonoActual) {
    map.removeLayer(poligonoActual);
    poligonoActual = null;
  }

  poligonoActual = L.polygon(puntosPoligono, {
    color: "blue",
    fillColor: "#00f",
    fillOpacity: 0.3,
    weight: 2
  }).addTo(map);

  calcularAreaYPerimetro(puntosPoligono);
}

/* =========================
   ÁREA Y PERÍMETRO
========================= */
function calcularAreaYPerimetro(puntos) {
  try {
    if (!window.turf) {
      console.warn("Turf.js no está cargado");
      return;
    }

    const coords = puntos.map(([lat, lng]) => [lng, lat]);
    coords.push(coords[0]); // cerrar polígono

    const polygon = turf.polygon([coords]);

    const area = turf.area(polygon);
    const perimetro = turf.length(polygon, { units: "meters" });

    const divArea = document.getElementById("area");
    const divPerimetro = document.getElementById("perimetro");

    if (divArea) {
      divArea.textContent = `Área: ${area.toFixed(2)} m²`;
    }

    if (divPerimetro) {
      divPerimetro.textContent = `Perímetro: ${perimetro.toFixed(2)} m`;
    }

  } catch (err) {
    console.error("Error calculando área:", err);
  }
}

/* =========================
   RESET POLÍGONO
========================= */
export function resetPoligono() { // Se accede a window.mapInstance directamente
  const map = window.mapInstance;

  if (map && poligonoActual) {
    map.removeLayer(poligonoActual);
  }

  poligonoActual = null;
  puntosPoligono = [];

  const divArea = document.getElementById("area");
  const divPerimetro = document.getElementById("perimetro");

  if (divArea) divArea.textContent = "Área: ---";
  if (divPerimetro) divPerimetro.textContent = "Perímetro: ---";
}