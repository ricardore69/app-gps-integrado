# Documentación técnica – poligonos.js

## Propósito del módulo
El archivo `poligonos.js` se encarga de calcular áreas y perímetros a partir de los puntos capturados en un levantamiento. Su función principal es transformar una lista de coordenadas GPS en un polígono cerrado, calcular su superficie, su perímetro y mostrar los resultados al usuario. Este módulo es esencial para trabajos topográficos donde se requiere medir terrenos, lotes o superficies irregulares.

## Ubicación
public/poligonos.js

## Dependencias utilizadas
- Firebase Firestore (lectura de puntos del levantamiento)
- Módulo local `conexion.js` (auth, db)
- Leaflet.js (opcional, para visualizar el polígono)
- DOM para mostrar resultados
- URL parameters para identificar levantamiento

## Funciones principales del módulo

### 1. Carga de puntos desde Firestore
El módulo obtiene todos los puntos del levantamiento:
usuarios/{usuarioId}/levantamientos/{levantamientoId}/puntos

Los puntos se ordenan por correlativo para mantener la forma correcta del polígono.

Cada punto contiene:
- latitud
- longitud
- altitud
- correlativo

### 2. Conversión de coordenadas
Los puntos GPS (latitud/longitud) se convierten a coordenadas planas (X, Y) usando una proyección aproximada:

- Conversión a radianes
- Cálculo de metros por grado
- Ajuste por latitud media

Esto permite aplicar fórmulas geométricas.

### 3. Cálculo del área del polígono
El módulo usa la fórmula del **Shoelace** (Gauss):

Área = 1/2 | Σ(xᵢ yᵢ₊₁ − xᵢ₊₁ yᵢ) |

El área se devuelve en:
- m²
- hectáreas
- km²

### 4. Cálculo del perímetro
El perímetro se calcula sumando las distancias entre puntos consecutivos:

distancia = Haversine(lat1, lon1, lat2, lon2)

El resultado se muestra en metros.

### 5. Cierre automático del polígono
Si el primer y último punto no coinciden, el módulo cierra el polígono automáticamente agregando el primer punto al final.

### 6. Visualización del polígono (si aplica)
El módulo puede:
- Dibujar el polígono en Leaflet
- Mostrar vértices
- Ajustar zoom al polígono

### 7. Interacción con la interfaz
El módulo controla:
- Botón de calcular área
- Botón de mostrar polígono
- Tabla de puntos
- Mensajes de error
- Resultados numéricos

### 8. Manejo de errores
El módulo detecta:
- Levantamientos con menos de 3 puntos
- Puntos duplicados
- Coordenadas inválidas
- Firestore inaccesible

## Variables importantes

usuarioActual → UID del usuario  
levantamientoId → ID del levantamiento  
puntos → Lista de puntos ordenados  
poligono → Lista de puntos cerrados  
area → Área calculada  
perimetro → Perímetro calculado  

## Flujo interno del módulo

1. Leer parámetros de la URL  
2. Validar levantamiento activo  
3. Cargar puntos desde Firestore  
4. Ordenar puntos por correlativo  
5. Convertir coordenadas a plano  
6. Calcular área  
7. Calcular perímetro  
8. Dibujar polígono (opcional)  
9. Mostrar resultados al usuario  

## QA debe validar

- Carga correcta de puntos desde Firestore  
- Orden correcto de los puntos  
- Cierre automático del polígono  
- Cálculo correcto del área  
- Cálculo correcto del perímetro  
- Resultados coherentes con polígonos simples  
- Manejo correcto de polígonos con muchos vértices  
- Manejo de errores cuando hay menos de 3 puntos  
- Visualización correcta en el mapa  

## Errores manejados

- Levantamiento sin puntos  
- Menos de 3 puntos (no se puede formar polígono)  
- Firestore inaccesible  
- Coordenadas inválidas  
- Puntos duplicados o desordenados  

## Interacción con otros módulos

inicio.js → Selecciona levantamiento  
conexion.js → Proporciona auth y db  
levantamiento.js → Proporciona los puntos capturados  
mapa.js → Puede mostrar el polígono  
replanteo.js → No interactúa directamente  

# Fin de la documentación técnica de poligonos.js
