# Documentación técnica – levantamiento.js

## Propósito del módulo
El archivo `levantamiento.js` controla toda la lógica de captura de puntos GPS dentro de un levantamiento activo. Desde aquí se maneja la lectura de coordenadas en tiempo real, la conexión con el GPS externo vía Bluetooth, el guardado de puntos en Firestore, la visualización de puntos capturados, el manejo del levantamiento activo y la navegación entre modos (captura, replanteo, etc.). Es el módulo central del flujo de trabajo de campo en GeoZapp.

## Ubicación
public/levantamiento.js

## Dependencias utilizadas
- Firebase Firestore (lectura y escritura de puntos)
- Módulo local `conexion.js` (auth, db)
- API Web Bluetooth (para conectar al GPS externo)
- DOM para mostrar datos en pantalla
- LocalStorage para recordar levantamiento activo

## Funciones principales del módulo

### 1. Conexión al GPS externo
El módulo establece conexión vía Bluetooth con un receptor GPS compatible. Acciones típicas:
- Buscar dispositivos Bluetooth
- Conectarse al servicio NMEA o serial
- Leer cadenas NMEA en tiempo real
- Parsear latitud, longitud y altitud
- Detectar pérdida de señal o desconexión

### 2. Lectura de coordenadas en tiempo real
El módulo escucha datos del GPS y actualiza:
- Latitud
- Longitud
- Altitud
- Precisión (HDOP)
- Hora del fix
- Estado del GPS (fix válido / no válido)

### 3. Guardado de puntos en Firestore
Cada punto capturado se guarda en:
usuarios/{usuarioId}/levantamientos/{levantamientoId}/puntos

Datos guardados:
{
  latitud,
  longitud,
  altitud,
  precision,
  timestamp,
  correlativo
}

### 4. Carga de puntos existentes
Si el levantamiento ya tiene puntos, el módulo los carga y los muestra en:
- Tabla
- Lista de puntos
- Mapa (si corresponde)

### 5. Manejo del levantamiento activo
El módulo lee parámetros desde la URL:
?id=LEVANTAMIENTO_ID&accion=levantamiento

Y también desde localStorage:
levantamientoActivo

### 6. Interacción con la interfaz
El módulo controla:
- Botón de conectar GPS
- Botón de capturar punto
- Botón de volver al inicio
- Indicadores de estado del GPS
- Tabla de puntos capturados
- Mensajes de estado y errores

## Variables importantes

usuarioActual → UID del usuario autenticado  
levantamientoId → ID del levantamiento activo  
gpsDevice → Dispositivo Bluetooth conectado  
coordenadasActuales → Últimas coordenadas recibidas del GPS  
puntos → Lista de puntos capturados  
modo → Modo de trabajo (levantamiento, replanteo, etc.)

## Flujo interno del módulo

1. Leer parámetros de la URL  
2. Validar levantamiento activo  
3. Cargar puntos existentes desde Firestore  
4. Esperar conexión al GPS  
5. Leer coordenadas en tiempo real  
6. Capturar puntos bajo demanda  
7. Guardar en Firestore  
8. Actualizar tabla y mapa  
9. Permitir volver al inicio  

## QA debe validar

- Conexión estable al GPS externo  
- Lectura continua de coordenadas  
- Precisión correcta de lat/long/alt  
- Guardado correcto de puntos en Firestore  
- Orden correlativo de puntos  
- Carga correcta de puntos existentes  
- Manejo de errores de Bluetooth  
- Manejo de errores de Firestore  
- Redirección correcta al inicio  
- No duplicación de puntos  
- Correcto funcionamiento en modo offline (si aplica)  

## Errores manejados

- GPS no disponible  
- Bluetooth no soportado  
- Usuario sin levantamiento activo  
- Firestore sin permisos  
- Datos incompletos del GPS  
- Pérdida de conexión durante la captura  
- Intento de capturar sin señal válida  

## Interacción con otros módulos

inicio.js → Selecciona y crea levantamientos  
conexion.js → Proporciona auth y db  
mapa.js → Visualiza puntos capturados  
replanteo.js → Usa puntos del levantamiento para replanteo  
poligonos.js → Usa puntos para cálculo de áreas  

# Fin de la documentación técnica de levantamiento.js
