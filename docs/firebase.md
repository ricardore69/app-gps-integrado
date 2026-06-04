Documentación técnica – Firebase en GeoZapp
================================================

1. Propósito del documento
Este documento describe cómo GeoZapp utiliza Firebase:

Autenticación

Firestore

Estructura de colecciones

Reglas de seguridad

Flujo de datos

Buenas prácticas

Es esencial para mantenimiento, QA y nuevos desarrolladores.

2. Servicios de Firebase utilizados
Firebase Auth
Manejo de usuarios

Sesiones persistentes

Validación de identidad

Firestore Database
Almacenamiento de usuarios

Levantamientos

Puntos GPS

Firebase Hosting (opcional)
Para desplegar la app.

Firebase Storage (opcional)
Para fotos o archivos futuros.

3. Estructura de Firestore
usuarios
└── usuarioId
  ├── nombre
  ├── email
  ├── creado
  └── levantamientos
    └── levantamientoId
      ├── nombre
      ├── nombre_lower
      ├── fecha
      └── puntos
        └── puntoId
          latitud
          longitud
          altitud
          precision
          timestamp
          correlativo

4. Descripción de colecciones
usuarios/
Documento por usuario autenticado.
Campos:

usuarioId

nombre

email

creado

usuarios/{usuarioId}/levantamientos/
Documento por levantamiento.
Campos:

nombre

nombre_lower

fecha

usuarios/{usuarioId}/levantamientos/{levantamientoId}/puntos/
Documento por punto GPS.
Campos:

latitud

longitud

altitud

precision

timestamp

correlativo

5. Reglas de seguridad recomendadas
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /usuarios/{userId} {
allow read, write: if request.auth != null && request.auth.uid == userId;
match /levantamientos/{levId} {
allow read, write: if request.auth != null && request.auth.uid == userId;
match /puntos/{puntoId} {
allow read, write: if request.auth != null && request.auth.uid == userId;
}
}
}
}
}

Estas reglas garantizan:

Cada usuario solo accede a sus datos

No hay lectura cruzada entre usuarios

Seguridad total por UID

6. Flujo de datos en la aplicación
1. Inicio de sesión
Firebase Auth valida al usuario.
inicio.js carga /usuarios/{uid}.

2. Creación de levantamiento
inicio.js crea /usuarios/{uid}/levantamientos/{nuevoId}.

3. Captura de puntos
levantamiento.js guarda puntos en /usuarios/{uid}/levantamientos/{levId}/puntos/.

4. Visualización
mapa.js lee todos los puntos del levantamiento.

5. Replanteo
replanteo.js lee un punto específico.

6. Cálculo de áreas
poligonos.js lee todos los puntos y calcula área/perímetro.

7. Buenas prácticas aplicadas
Subcolecciones para escalabilidad

Documentos pequeños y rápidos

Campos normalizados (nombre_lower)

Timestamps ISO

Correlativo para orden

Reglas estrictas de seguridad

8. Posibles mejoras futuras
Storage para fotos

Índices compuestos

Firestore offline

Roles de usuario

Backups automáticos

Fin de la documentación técnica de Firebase en GeoZapp
================================================