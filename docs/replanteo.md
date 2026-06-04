# Documentación técnica – replanteo.js

## Propósito del módulo
El archivo `replanteo.js` controla la lógica de replanteo dentro de GeoZapp. Su función es guiar al usuario desde su posición actual hasta un punto previamente capturado en un levantamiento. El módulo calcula distancias, rumbos, diferencias de coordenadas y muestra instrucciones en tiempo real para acercarse al punto objetivo. Es el módulo usado para “volver al punto exacto” en campo.

## Ubicación
public/replanteo.js

## Dependencias utilizadas
- Firebase Firestore (lectura de puntos del levantamiento)
- Módulo local `conexion.js` (auth, db)
- API Web Bluetooth (para leer coordenadas del GPS externo)
- DOM para mostrar distancias, rumbos e instrucciones
- URL parameters para identificar levantamiento y punto objetivo

## Funciones principales del módulo

### 1. Carga del punto objetivo
El módulo obtiene desde Firestore el punto que se desea replantear:
usuarios/{usuarioId}/levantamientos/{levantamientoId}/puntos/{puntoId}

Datos cargados:
- latitud
- longitud
- altitud
- correlativo
- timestamp

El punto objetivo se muestra en pantalla.

### 2. Conexión al GPS externo
El módulo se conecta vía Bluetooth al receptor GPS:
- Busca dispositivos compatibles
- Lee datos NMEA en tiempo real
- Obtiene latitud, longitud, altitud y precisión
- Detecta pérdida de señal

### 3. Cálculo de distancia al punto objetivo
Cada vez que llegan coordenadas nuevas del GPS, se calcula:

distancia = Haversine(latActual, lonActual, latObjetivo, lonObjetivo)

El módulo muestra:
- Distancia en metros
- Diferencia en latitud
- Diferencia en longitud
- Diferencia en altitud

### 4. Cálculo del rumbo hacia el punto
El módulo calcula el rumbo (bearing) desde la posición actual hacia el punto objetivo:

rumbo = atan2(Δlong, Δlat)

Y lo convierte a grados:
- Norte
- Sur
- Este
- Oeste
- NE, SE, NO, SO

El rumbo se usa para mostrar flechas o instrucciones.

### 5. Indicaciones en tiempo real
El módulo muestra mensajes como:
- “Avanza hacia el norte”
- “Desplázate 3 metros al este”
- “Estás a 1.2 metros del punto”
- “Punto replanteado”

Cuando la distancia es menor a un umbral (ej. 0.50 m), se considera que el punto está replanteado.

### 6. Manejo de la interfaz
El módulo controla:
- Botón de conectar GPS
- Botón de volver al levantamiento
- Indicadores de precisión
- Indicadores de rumbo
- Mensajes de estado

### 7. Manejo de errores
El módulo detecta:
- GPS sin señal
- Bluetooth no soportado
- Punto inexistente
- Firestore inaccesible
- Usuario no autenticado

## Variables importantes

usuarioActual → UID del usuario  
levantamientoId → ID del levantamiento  
puntoId → ID del punto objetivo  
gpsDevice → Dispositivo Bluetooth conectado  
coordenadasActuales → Coordenadas del GPS  
puntoObjetivo → Coordenadas del punto a replantear  
distancia → Distancia actual al punto  
rumbo → Dirección hacia el punto  

## Flujo interno del módulo

1. Leer parámetros de la URL  
2. Validar levantamiento y punto objetivo  
3. Cargar punto desde Firestore  
4. Conectar al GPS  
5. Leer coordenadas en tiempo real  
6. Calcular distancia y rumbo  
7. Mostrar instrucciones al usuario  
8. Detectar llegada al punto  
9. Permitir volver al levantamiento  

## QA debe validar

- Carga correcta del punto objetivo  
- Conexión estable al GPS  
- Cálculo correcto de distancia  
- Cálculo correcto del rumbo  
- Actualización en tiempo real  
- Mensajes coherentes según la distancia  
- Detección correcta de “punto alcanzado”  
- Manejo de errores de Bluetooth  
- Manejo de errores de Firestore  
- Redirección correcta al levantamiento  

## Errores manejados

- Punto no encontrado  
- GPS sin señal  
- Bluetooth no soportado  
- Usuario no autenticado  
- Firestore inaccesible  
- Coordenadas inválidas  

## Interacción con otros módulos

inicio.js → Selecciona levantamiento  
conexion.js → Proporciona auth y db  
levantamiento.js → Proporciona los puntos a replantear  
mapa.js → Puede mostrar el punto objetivo en el mapa  

# Fin de la documentación técnica de replanteo.js
