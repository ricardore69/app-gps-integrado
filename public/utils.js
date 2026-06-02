// utils/geotools.js
import proj4 from "https://cdn.jsdelivr.net/npm/proj4@2.11.0/+esm";

// Proyección MAGNA-SIRGAS / Gauss-Krüger (Origen Oeste, zona Colombia)
const magnaSirgas =
  "+proj=tmerc +lat_0=0 +lon_0=-75 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs";

// Convierte [lat, lng] en coordenadas UTM aproximadas (en metros)
export function convertirLatLngAUTM(lat, lng) {
  return proj4("WGS84", magnaSirgas, [lng, lat]); // Proj4 usa (lng, lat)
}

// Calcula área de un polígono usando la fórmula del área con coordenadas planas
export function calcularArea(puntos) {
  const convertidos = puntos.map(([lat, lng]) => convertirLatLngAUTM(lat, lng));

  let area = 0;
  for (let i = 0; i < convertidos.length; i++) {
    const [x1, y1] = convertidos[i];
    const [x2, y2] = convertidos[(i + 1) % convertidos.length];
    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area / 2); // Área en metros cuadrados
}
