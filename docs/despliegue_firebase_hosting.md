# Documentación técnica – Despliegue en Firebase Hosting

## 1. Propósito del documento
Este documento explica cómo desplegar GeoZapp en Firebase Hosting, desde la instalación hasta obtener una URL pública. Incluye configuración, comandos y solución de errores comunes.

---

## 2. Requisitos previos
Antes de iniciar, necesitas:
- Node.js instalado
- Cuenta de Firebase
- Proyecto creado en Firebase Console
- Carpeta “public/” con los archivos HTML, JS y CSS

---

## 3. Instalar Firebase CLI
Ejecutar en terminal:

npm install -g firebase-tools

Verificar instalación:

firebase --version

---

## 4. Iniciar sesión en Firebase
Ejecutar:

firebase login

Se abrirá el navegador para iniciar sesión.

---

## 5. Inicializar Firebase Hosting
En la raíz del proyecto ejecutar:

firebase init hosting

Responde lo siguiente:

1. Select a Firebase project → Elegir tu proyecto  
2. Public directory → escribir: public  
3. Configure as a single-page app? → No  
4. Overwrite index.html? → No  

Esto crea:
- firebase.json  
- .firebaserc  

---

## 6. Estructura mínima del proyecto

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
│   └── demás archivos  
├── firebase.json  
└── .firebaserc  

---

## 7. Primer despliegue
Ejecutar:

firebase deploy

Firebase mostrará:

✔ Deploy complete  
Hosting URL: https://tu-proyecto.web.app

Esa es tu URL pública.

---

## 8. Actualizar la aplicación
Cada vez que modifiques archivos en /public:

firebase deploy

---

## 9. Archivo firebase.json recomendado

{
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}

---

## 10. Errores comunes

### Error: “public directory does not exist”
La carpeta debe llamarse exactamente “public”.

### Error: “Permission denied”
Ejecutar:
firebase login  
firebase use --add

### Error: “index.html overwritten”
Responde “No” cuando pregunte si quieres sobrescribir.

### Error: “Hosting site not found”
Selecciona el proyecto correcto en firebase init.

---

## 11. Buenas prácticas
- Mantener la carpeta public limpia  
- No subir archivos innecesarios  
- Usar rutas relativas correctas  
- Probar localmente antes de desplegar  

---

## 12. Comandos útiles
firebase login  
firebase logout  
firebase init  
firebase deploy  
firebase projects:list  
firebase use --add  

---

# Fin de la documentación técnica de despliegue en Firebase Hosting
