# Documentación técnica – mapa.js

## Propósito del módulo
El archivo `mapa.js` controla la visualización de puntos GPS dentro de GeoZapp. Su función principal es mostrar en un mapa todos los puntos capturados durante un levantamiento, permitiendo al usuario visualizar su distribución espacial, revisar coordenadas, analizar trayectorias y validar la calidad del levantamiento. Este módulo no captura puntos; únicamente los muestra.

## Ubicación
public/mapa.js

## Dependencias utilizadas
- Leaflet.js (librería de mapas)
- Firebase Firestore (lectura de puntos)
- Módulo local `conexion.js` (auth, db)
- DOM para mostrar información del mapa
- URL parameters para identificar levantamiento

## Funciones principales del módulo

### 1. Inicialización del mapa
El módulo crea un mapa interactivo usando Leaflet:
- Define centro inicial
- Define nivel de zoom
- Carga tiles (OpenStreetMap u otros)
- Prepara capas para puntos y polilíneas

### 2. Carga de puntos desde Firestore
Los puntos se leen desde:
usuarios/{usuarioId}/levantamientos/{levantamientoId}/puntos

Cada punto contiene:
- latitud
- longitud
- altitud
- precisión
- timestamp
- correlativo

El módulo:
- Obtiene todos los puntos
- Los ordena por correlativo
- Los dibuja en el mapa

### 3. Dibujo de puntos en el mapa
Cada punto se representa como un marcador Leaflet:
- Marcador simple o icono personalizado
- Popup con información del punto:
  - Coordenadas
  - Altitud
  - Fecha y hora
  - Precisión
  - Número de punto

### 4. Dibujo de polilínea
Si el levantamiento tiene varios puntos:
- Se dibuja una línea que conecta todos los puntos en orden
- Permite visualizar la trayectoria del levantamiento

### 5. Ajuste automático del mapa
El módulo ajusta el mapa automáticamente:
- Centra el mapa en los puntos
- Ajusta el zoom para que todos entren en pantalla
- Si solo hay un punto, centra en ese punto

### 6. Interacción con la interfaz
El módulo controla:
- Botón de volver al inicio
- Botón de recargar puntos
- Mensajes de estado
- Indicadores de carga

### 7. Manejo de errores
El módulo detecta:
- Levantamiento inexistente
- Usuario no autenticado
- Firestore sin datos
- Errores de conexión

## Variables importantes

usuarioActual → UID del usuario autenticado  
levantamientoId → ID del levantamiento a visualizar  
map → instancia del mapa Leaflet  
markers → lista de marcadores  
polyline → línea que conecta los puntos  
puntos → lista de puntos cargados desde Firestore  

## Flujo interno del módulo

1. Leer parámetros de la URL  
2. Validar levantamiento activo  
3. Inicializar mapa Leaflet  
4. Cargar puntos desde Firestore  
5. Dibujar marcadores  
6. Dibujar polilínea  
7. Ajustar zoom  
8. Mostrar información en popups  
9. Permitir volver al inicio  

## QA debe validar

- Carga correcta de puntos desde Firestore  
- Orden correcto de los puntos  
- Marcadores visibles en el mapa  
- Popups con información correcta  
- Polilínea dibujada correctamente  
- Zoom automático funcionando  
- Manejo correcto de levantamientos vacíos  
- No duplicación de puntos en el mapa  
- Rendimiento adecuado con muchos puntos  

## Errores manejados

- Levantamiento sin puntos  
- Firestore inaccesible  
- Usuario no autenticado  
- Parámetros de URL inválidos  
- Coordenadas corruptas o incompletas  

## Interacción con otros módulos

inicio.js → Selecciona levantamiento  
conexion.js → Proporciona auth y db  
levantamiento.js → Captura puntos que luego se muestran aquí  
replanteo.js → Puede usar el mapa para mostrar puntos objetivo  

# Fin de la documentación técnica de mapa.js
