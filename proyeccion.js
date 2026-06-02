// proyeccion.js
import proj4 from "https://cdn.jsdelivr.net/npm/proj4@2.9.0/dist/proj4.min.js";

export function convertirAGaussKruger(lat, lon) {
  const zona = obtenerZonaGaussKruger(lon);
  const projGK = `+proj=tmerc +lat_0=0 +lon_0=${
    (zona - 1) * 3 - 75
  } +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +units=m +no_defs`;
  return proj4("WGS84", projGK, [lon, lat]);
}

function obtenerZonaGaussKruger(lon) {
  let zona = Math.floor((lon + 180) / 3) + 1;
  if (zona < 16) zona = 16;
  if (zona > 19) zona = 19;
  return zona;
}
