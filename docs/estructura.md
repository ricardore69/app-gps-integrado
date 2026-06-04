# Documentación técnica – Estructura del proyecto GeoZapp

## Propósito del documento
Este archivo describe la estructura completa del proyecto GeoZapp, explicando la función de cada carpeta y archivo. Su objetivo es que cualquier desarrollador, QA o mantenedor pueda entender rápidamente cómo está organizado el sistema y dónde se encuentra cada componente.

---

# Estructura general del proyecto

La estructura recomendada del proyecto es:

proyecto/
│
├── public/
│   ├── index.html
│   ├── login.html
│   ├── inicio.html
│   ├── levantamiento.html
│   ├── mapa.html
│   ├── replanteo.html
│   ├── poligonos.html
│   ├── conexion.js
│   ├── inicio.js
│   ├── levantamiento.js
│   ├── mapa.js
│   ├── replanteo.js
│   ├── poligonos.js
│   ├── utils.js
│   └── estilos/ (CSS)
│
├── docs/
│   ├── conexion.md
│   ├── inicio.md
│   ├── levantamiento.md
│   ├── mapa.md
│   ├── replanteo.md
│   ├── poligonos.md
│   ├── utils.md
│   ├── arquitectura.md
│   ├── estructura.md
│   └── firebase.md
│
├── assets/ (opcional)
│   ├── iconos/
│   ├── logos/
│   └── imágenes/
│
├── README.md
└── package.json (si aplica)

---

# Descripción de carpetas

## 📁 public/
Contiene **todas las pantallas y lógica del frontend**.  
Es la carpeta principal del proyecto.

Incluye:

- HTML de cada módulo
- JS de cada módulo
- CSS
- Conexión a Firebase
- Lógica de GPS
- Mapas
- Replanteo
- Cálculo de áreas

Es la carpeta que se despliega en producción.

---

## 📁 docs/
Contiene **toda la documentación técnica del proyecto**.

Incluye:

- Documentación de cada módulo JS
- Arquitectura general
- Estructura del proyecto
- Documentación de Firebase
- Guías de QA

Esta carpeta es esencial para GitHub y para cualquier desarrollador nuevo.

---

## 📁 assets/ (opcional)
Contiene imágenes, íconos, logos o recursos gráficos.

---

## 📄 README.md
Documento principal del repositorio.  
Debe incluir:

- Descripción del proyecto
- Cómo instalar
- Cómo ejecutar
- Tecnologías usadas
- Estructura del proyecto
- Créditos

---

# Descripción de archivos principales

## HTML
Cada pantalla tiene su propio archivo:

- **inicio.html** → Selección de levantamientos  
- **levantamiento.html** → Captura de puntos GPS  
- **mapa.html** → Visualización de puntos  
- **replanteo.html** → Guía hacia un punto  
- **poligonos.html** → Cálculo de áreas  
- **login.html** → Autenticación  

---

## JavaScript

### conexion.js
Inicializa Firebase y expone `auth` y `db`.

### inicio.js
Carga levantamientos, crea nuevos y redirige a los módulos.

### levantamiento.js
Conecta al GPS, captura puntos y los guarda en Firestore.

### mapa.js
Dibuja puntos y recorridos en Leaflet.

### replanteo.js
Guía al usuario hacia un punto objetivo.

### poligonos.js
Calcula áreas y perímetros.

### utils.js
Funciones matemáticas y geodésicas.

---

# Flujo de carpetas y archivos

1. El usuario entra a **login.html**  
2. Si inicia sesión → va a **inicio.html**  
3. Selecciona un levantamiento → va a:
   - levantamiento.html  
   - mapa.html  
   - replanteo.html  
   - poligonos.html  
4. Cada pantalla carga su JS correspondiente  
5. Todos los JS usan `conexion.js`  
6. Todos los datos se guardan en Firestore  

---

# Buenas prácticas aplicadas

- Separación por módulos  
- Documentación por archivo  
- Estructura clara y escalable  
- Uso de Firebase como backend serverless  
- Código organizado por pantallas  
- Carpeta `docs/` para documentación profesional  

---

# Fin de la documentación técnica de estructura del proyecto
