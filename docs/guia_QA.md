# Guía completa de QA – GeoZapp

## Propósito del documento
Esta guía define todas las pruebas funcionales, técnicas y de flujo que QA debe ejecutar para validar GeoZapp. Incluye casos de prueba por módulo, validaciones de datos, pruebas de GPS, Firestore, interfaz, rendimiento y errores esperados.

---

# 1. Pruebas generales del sistema

## 1.1 Autenticación
- Validar inicio de sesión con usuario válido.
- Validar error con usuario incorrecto.
- Validar cierre de sesión.
- Validar persistencia de sesión al recargar la página.
- Validar redirección a login si no hay sesión activa.

## 1.2 Navegación
- Validar que cada botón redirige a la pantalla correcta.
- Validar que los parámetros de URL se envían correctamente.
- Validar que no se puede acceder a módulos sin levantamiento activo.

## 1.3 Firestore
- Validar lectura de datos.
- Validar escritura de datos.
- Validar actualización de puntos.
- Validar estructura correcta de documentos.
- Validar que un usuario no puede ver datos de otro.

---

# 2. Pruebas por módulo

# 2.1 Módulo: inicio.js
### Validaciones
- Carga correcta de levantamientos del usuario.
- Creación de un nuevo levantamiento.
- Orden correcto por fecha.
- Redirección a levantamiento, mapa, replanteo o polígonos.
- Manejo de levantamiento activo en localStorage.

### Errores esperados
- Usuario sin levantamientos.
- Firestore inaccesible.
- Levantamiento sin nombre.

---

# 2.2 Módulo: levantamiento.js
### Validaciones
- Conexión al GPS vía Bluetooth.
- Lectura continua de coordenadas.
- Precisión mostrada correctamente.
- Captura de puntos manual.
- Guardado en Firestore con correlativo incremental.
- Validación de coordenadas válidas.
- Actualización en tiempo real de latitud, longitud y altitud.

### Errores esperados
- GPS sin señal.
- Bluetooth no soportado.
- Usuario cancela conexión.
- Coordenadas inválidas.
- Firestore inaccesible.

---

# 2.3 Módulo: mapa.js
### Validaciones
- Carga de puntos desde Firestore.
- Dibujo de marcadores en Leaflet.
- Dibujo de polilínea del recorrido.
- Zoom automático al conjunto de puntos.
- Mostrar información al hacer clic en un punto.

### Errores esperados
- Levantamiento sin puntos.
- Firestore inaccesible.
- Coordenadas corruptas.

---

# 2.4 Módulo: replanteo.js
### Validaciones
- Carga del punto objetivo desde Firestore.
- Conexión al GPS.
- Cálculo correcto de distancia (Haversine).
- Cálculo correcto de rumbo.
- Actualización en tiempo real.
- Mensajes coherentes según distancia:
  - “Avanza hacia el norte”
  - “Desplázate X metros”
  - “Estás a menos de 1 metro”
- Detección correcta de “punto alcanzado”.

### Errores esperados
- Punto no encontrado.
- GPS sin señal.
- Bluetooth desconectado.
- Firestore inaccesible.

---

# 2.5 Módulo: poligonos.js
### Validaciones
- Carga de puntos del levantamiento.
- Orden correcto por correlativo.
- Cierre automático del polígono.
- Cálculo correcto del área (Shoelace).
- Cálculo correcto del perímetro (Haversine).
- Dibujo del polígono en Leaflet.
- Conversión correcta a m², ha y km².

### Errores esperados
- Menos de 3 puntos.
- Puntos duplicados.
- Coordenadas inválidas.
- Firestore inaccesible.

---

# 2.6 Módulo: utils.js
### Validaciones
- Conversión grados ↔ radianes.
- Distancia Haversine correcta.
- Rumbo correcto.
- Normalización de ángulos.
- Validación de coordenadas.
- Conversión a plano (X/Y) correcta.

### Errores esperados
- Valores NaN.
- Coordenadas fuera de rango.
- División por cero en rumbos.

---

# 3. Pruebas de rendimiento

## 3.1 GPS
- Lectura estable durante 5 minutos.
- Latencia menor a 1 segundo entre lecturas.
- Manejo correcto de pérdida de señal.

## 3.2 Firestore
- Lectura de 100 puntos sin retrasos.
- Escritura de puntos en menos de 300 ms.
- Manejo de red lenta.

---

# 4. Pruebas de interfaz (UI/UX)

- Botones visibles y funcionales.
- Textos legibles en móvil.
- Mapa ajusta zoom correctamente.
- Indicadores de precisión visibles.
- Mensajes de error claros.
- Flujo intuitivo entre pantallas.

---

# 5. Pruebas de seguridad

- Un usuario no puede ver levantamientos de otro.
- No se puede modificar puntos ajenos.
- Reglas de Firestore aplicadas correctamente.
- Validación de sesión en cada módulo.

---

# 6. Pruebas de flujo completo

## Flujo 1: Crear levantamiento
1. Iniciar sesión  
2. Crear levantamiento  
3. Capturar 5 puntos  
4. Ver puntos en mapa  
5. Calcular área  
6. Replantear un punto  

## Flujo 2: Replanteo directo
1. Seleccionar levantamiento  
2. Elegir punto  
3. Conectar GPS  
4. Llegar al punto  

## Flujo 3: Validación de datos
1. Crear levantamiento  
2. Capturar puntos con precisión baja  
3. Validar mensajes de advertencia  

---

# 7. Checklist final de QA

- [ ] Autenticación validada  
- [ ] Navegación correcta  
- [ ] GPS funcionando  
- [ ] Firestore leyendo/escribiendo  
- [ ] Cálculo de distancias correcto  
- [ ] Cálculo de rumbos correcto  
- [ ] Cálculo de áreas correcto  
- [ ] Mapa funcionando  
- [ ] Replanteo funcionando  
- [ ] Errores manejados  
- [ ] UI correcta  
- [ ] Flujo completo validado  

---

# Fin de la guía completa de QA para GeoZapp
