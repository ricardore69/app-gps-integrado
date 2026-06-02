import { db } from "./conexion.js";
import { cargarPuntos } from "./levantamiento.js";
import { cargarPuntosEnMapa } from "./mapa.js";
import {
  dibujarPoligono,
  resetPoligono,
  setPuntosPoligono,
} from "./poligonos.js";
import { iniciarReplanteo } from "./replanteo.js"; // NUEVO

document
  .getElementById("btn-replanteo")
  .addEventListener("click", iniciarReplanteo);

// Hacer funciones accesibles desde HTML si es necesario
window.dibujarPoligono = dibujarPoligono;
window.resetPoligono = resetPoligono;

let puntosSeleccionados = [];

window.addEventListener("DOMContentLoaded", async () => {
  // La carga de puntos ahora es manejada por levantamiento.js después de la autenticación.

  // Escucha clicks de selección desde la tabla
  document.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("seleccionar")) {
      const lat = parseFloat(e.target.dataset.lat);
      const lng = parseFloat(e.target.dataset.lng);

      const yaSeleccionado = puntosSeleccionados.some(
        (p) => p[0] === lat && p[1] === lng
      );

      if (!yaSeleccionado) {
        puntosSeleccionados.push([lat, lng]);
        e.target.style.backgroundColor = "#0f0"; // Marcar como seleccionado
      }

      setPuntosPoligono(puntosSeleccionados);
    }
  });

  // Botón para dibujar polígono
  const botonDibujar = document.getElementById("dibujar");
  if (botonDibujar) {
    botonDibujar.addEventListener("click", () => {
      dibujarPoligono();
    });
  }

  // Botón para limpiar polígono
  const botonLimpiar = document.getElementById("limpiar");
  if (botonLimpiar) {
    botonLimpiar.addEventListener("click", () => {
      puntosSeleccionados = [];
      resetPoligono();
      document.querySelectorAll(".seleccionar").forEach((btn) => {
        btn.style.backgroundColor = "";
      });
    });
  }
});
