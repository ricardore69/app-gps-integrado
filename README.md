# GeoZapp – Sistema de levantamiento, replanteo y cálculo topográfico

GeoZapp es una aplicación web diseñada para capturar puntos GPS, visualizar recorridos, realizar replanteos en campo y calcular áreas y perímetros de polígonos. Está pensada para topografía ligera, catastro, agrimensura, obras civiles y trabajos de campo que requieren precisión y simplicidad.

---

# 🚀 Características principales

## 📍 Captura de puntos GPS
- Conexión vía **Web Bluetooth** a receptores GPS externos.
- Lectura en tiempo real de latitud, longitud, altitud y precisión.
- Captura manual de puntos con correlativo automático.
- Guardado inmediato en Firestore.

## 🗺 Visualización en mapa
- Mapa interactivo con **Leaflet.js**.
- Marcadores de puntos capturados.
- Polilínea del recorrido.
- Zoom automático al levantamiento.

## 🎯 Replanteo de puntos
- Selección de un punto objetivo.
- Cálculo de distancia en tiempo real (Haversine).
- Cálculo de rumbo hacia el objetivo.
- Indicaciones dinámicas para llegar al punto.

## 📐 Cálculo de áreas y perímetros
- Cierre automático del polígono.
- Área mediante fórmula Shoelace.
- Perímetro mediante Haversine.
- Resultados en m², hectáreas y km².
- Visualización del polígono en mapa.

## 🔥 Integración con Firebase
- Firebase Auth para usuarios.
- Firestore para levantamientos y puntos.
- Hosting opcional para despliegue.

---

# 🧱 Arquitectura del proyecto

El proyecto está organizado por módulos independientes:

- **conexion.js** → Inicializa Firebase  
- **inicio.js** → Gestión de levantamientos  
- **levantamiento.js** → Captura de puntos GPS  
- **mapa.js** → Visualización en Leaflet  
- **replanteo.js** → Guía hacia un punto  
- **poligonos.js** → Cálculo de áreas  
- **utils.js** → Funciones matemáticas y geodésicas  

Documentación completa disponible en `/docs`.

---

# 📂 Estructura del proyecto

proyecto/  
├── public/  
│   ├── index.html  
│   ├── login.html  
│   ├── inicio.html  
│   ├── levantamiento.html  
│   ├── mapa.html  
│   ├── replanteo.html  
│   ├── poligonos.html  
│   ├── conexion.js  
│   ├── utils.js  
│   └── estilos/  
├── docs/  
│   ├── arquitectura.md  
│   ├── estructura.md  
│   ├── firebase.md  
│   ├── guia_QA.md  
│   ├── conexion.md  
│   ├── levantamiento.md  
│   ├── mapa.md  
│   ├── replanteo.md  
│   ├── poligonos.md  
│   └── utils.md  
└── README.md  

---

# 🛠 Tecnologías utilizadas

- **JavaScript**
- **HTML5 / CSS3**
- **Leaflet.js**
- **Firebase Auth**
- **Firestore**
- **Firebase Hosting**
- **Web Bluetooth API**

---

# 📦 Instalación y ejecución local

1. Clonar el repositorio  
2. Instalar Firebase CLI  
3. Ejecutar:  
   firebase login  
4. Inicializar hosting (solo la primera vez):  
   firebase init hosting  
5. Ejecutar localmente con extensión Live Server o similar  
6. Conectar GPS vía Bluetooth desde levantamiento.html

---

# 🌐 Despliegue en Firebase Hosting

Para publicar la app:

firebase deploy

La URL pública aparecerá en consola.

---

# 🧪 QA y pruebas

La guía completa de QA está disponible en: docs/guia_QA.md

Incluye:
- Pruebas funcionales  
- Pruebas de GPS  
- Pruebas de Firestore  
- Pruebas de UI  
- Flujos completos  
- Checklist final  

---

# 👤 Autor

Proyecto desarrollado por **Ricardo**.

---

# 📄 Licencia

Este proyecto puede utilizarse, modificarse y distribuirse libremente según las necesidades del usuario.


