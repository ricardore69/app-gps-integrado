# Documentación técnica – utils.js

## Propósito del módulo
El archivo `utils.js` contiene funciones auxiliares utilizadas en varios módulos de GeoZapp. Su objetivo es centralizar cálculos, conversiones y operaciones repetitivas para evitar duplicación de código. Incluye funciones matemáticas, geodésicas, de formato y validación que son esenciales para el funcionamiento de levantamiento, replanteo, poligonos y mapa.

## Ubicación
public/utils.js

## Dependencias utilizadas
- Ninguna externa (normalmente)
- Puede ser usado por:
  - levantamiento.js
  - replanteo.js
  - poligonos.js
  - mapa.js

## Funciones principales del módulo

### 1. Conversión de grados a radianes
Convierte grados a radianes para cálculos trigonométricos.

rad = grados * (π / 180)

Usado en:
- Cálculo de distancias
- Cálculo de rumbos
- Fórmulas geodésicas

### 2. Conversión de radianes a grados
Convierte radianes a grados.

grados = rad * (180 / π)

Usado en:
- Mostrar rumbos en grados
- Normalizar ángulos

### 3. Cálculo de distancia Haversine
Calcula la distancia entre dos coordenadas GPS usando la fórmula Haversine:

distancia = 2R * asin( sqrt( sin²(Δlat/2) + cos(lat1)*cos(lat2)*sin²(Δlon/2) ) )

Donde R = 6371000 metros.

Usado en:
- replanteo.js (distancia al punto objetivo)
- poligonos.js (perímetro)
- mapa.js (distancias entre puntos)

### 4. Cálculo de rumbo (bearing)
Calcula el rumbo desde un punto A hacia un punto B:

rumbo = atan2( sin(Δlon)*cos(lat2), cos(lat1)*sin(lat2) − sin(lat1)*cos(lat2)*cos(Δlon) )

Devuelve grados normalizados entre 0° y 360°.

Usado en:
- replanteo.js

### 5. Normalización de ángulos
Asegura que un ángulo esté entre 0° y 360°.

### 6. Formateo de números
Funciones típicas:
- Redondear a N decimales
- Convertir metros a kilómetros
- Convertir m² a hectáreas
- Formatear coordenadas

Usado en:
- poligonos.js
- mapa.js
- levantamiento.js

### 7. Validación de coordenadas
Verifica que:
- latitud esté entre -90 y 90
- longitud esté entre -180 y 180
- no existan valores nulos o NaN

Usado en:
- levantamiento.js
- replanteo.js

### 8. Generación de correlativo
Genera un número incremental para puntos capturados.

Usado en:
- levantamiento.js

### 9. Conversión de coordenadas a plano (aproximada)
Convierte lat/lon a X/Y en metros usando una proyección simple:

x = Δlon * cos(latMedia) * 111320  
y = Δlat * 110540

Usado en:
- poligonos.js (cálculo de área)

## Variables importantes
Este módulo normalmente no maneja estado, solo funciones puras.

## Flujo interno del módulo
1. Recibe parámetros desde otros módulos  
2. Ejecuta cálculos matemáticos  
3. Devuelve resultados listos para usar  
4. No interactúa con Firestore ni con el DOM  

## QA debe validar
- Distancias correctas entre puntos conocidos  
- Rumbos correctos comparados con brújula real  
- Conversión correcta de grados ↔ radianes  
- Área correcta en polígonos simples  
- Perímetro correcto  
- Validación correcta de coordenadas inválidas  
- No modificar valores originales (funciones puras)  

## Errores manejados
- Coordenadas fuera de rango  
- Valores nulos o indefinidos  
- Cálculos con NaN  
- División por cero en rumbos  

## Interacción con otros módulos

levantamiento.js → Usa distancia, validación y correlativo  
replanteo.js → Usa distancia, rumbo y normalización  
poligonos.js → Usa distancia, proyección y área  
mapa.js → Usa formateo y validación  

# Fin de la documentación técnica de utils.js
