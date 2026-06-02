const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

let mainWindow;
let port;

// Variables de estado global para sincronización
let gpsConectadoGlobal = false;
let ultimoErrorGps = null;

/* =========================
   VENTANA
========================= */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Cargar variables de entorno para Firebase (ej. desde un .env)
    // En un proyecto real, usarías dotenv o similar, o pasarías esto de forma segura.
    // Por simplicidad, las pasamos directamente aquí para que preload.js las exponga.
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('firebase-config', {
            apiKey: process.env.FIREBASE_API_KEY || "AIzaSyARWC5Tp6mR9FnLdGr4-2I37wAbDOCfM9I",
            authDomain: process.env.FIREBASE_AUTH_DOMAIN || "proyectogps3070033.firebaseapp.com",
            projectId: process.env.FIREBASE_PROJECT_ID || "proyectogps3070033",
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "proyectogps3070033.firebaseapp.com",
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "655380394634",
            appId: process.env.FIREBASE_APP_ID || "1:655380394634:web:c577c70f092c1f6c05b373",
            measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-TEPTKTVE2C",
        });
    });

    mainWindow.loadFile(path.join(__dirname, 'public', 'login.html'));
    mainWindow.webContents.openDevTools();
}

/* =========================
   APP START
========================= */
app.whenReady().then(() => {
    createWindow();
    conectarGPS('COM4');
});

/* Pedir el estado actual del GPS (útil al cambiar de página) */
ipcMain.handle('get-gps-estado', () => {
    return { conectado: gpsConectadoGlobal, error: ultimoErrorGps };
});

/* IPC Listeners para el puerto Serial */
ipcMain.handle('get-puertos', async () => {
    return await SerialPort.list();
});

ipcMain.on('cambiar-puerto', (event, nuevoPuerto) => {
    conectarGPS(nuevoPuerto);
});

function conectarGPS(pathPuerto) {
    if (port && port.isOpen) {
        port.close((err) => {
            if (err) console.error("Error al cerrar puerto:", err.message);
            iniciarPuerto(pathPuerto);
        });
    } else {
        iniciarPuerto(pathPuerto);
    }
}

function iniciarPuerto(pathPuerto) {
    console.log(`📡 Intentando conectar al GPS en ${pathPuerto}...`);
    port = new SerialPort({
        path: pathPuerto,
        baudRate: 9600,
        autoOpen: false // Controlamos la apertura manualmente para manejar el error 121
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    port.open((err) => {
        if (err) {
            gpsConectadoGlobal = false;
            ultimoErrorGps = err.message;
            console.error('❌ Error serial (121 o similar):', err.message);
            if (mainWindow) {
                mainWindow.webContents.send('gps-estado', { conectado: false, error: err.message });
            }
            // Reintentar automáticamente en 5 segundos si falla la apertura
            setTimeout(() => conectarGPS(pathPuerto), 5000);
            return;
        }

        gpsConectadoGlobal = true;
        ultimoErrorGps = null;
        console.log('✅ GPS conectado por serial');
        if (mainWindow) {
            mainWindow.webContents.send('gps-estado', { conectado: true });
        }
    });

    parser.on('data', (linea) => {
        // 🛠️ LOG DE DEPURACIÓN: Ver exactamento qué envía el GPS por la terminal
        console.log("📥 NMEA Recibido:", linea);

        // Enviar raw NMEA al frontend para depuración en la consola del navegador
        if (mainWindow) {
            mainWindow.webContents.send('nmea-raw', linea);
        }

        if (mainWindow && linea.includes('GGA') && linea.split(',')[6] === '0') {
            mainWindow.webContents.send('gps-estado', { conectado: true, mensaje: 'Buscando satélites (Sin Fix)...' });
        }

        const coords = parsearNMEA(linea);
        if (coords && mainWindow) {
            mainWindow.webContents.send('nuevas-coordenadas', coords);
        }
    });

    port.on('close', () => {
        console.warn('⚠️ Puerto serial cerrado. Reintentando...');
        gpsConectadoGlobal = false;
        if (mainWindow) {
            mainWindow.webContents.send('gps-estado', { conectado: false, mensaje: 'Conexión perdida' });
        }
        setTimeout(() => conectarGPS(pathPuerto), 5000);
    });

    port.on('error', (err) => {
        console.error('❌ Error en tiempo de ejecución serial:', err.message);
    });
}

/* =========================
   PARSER NMEA ROBUSTO
========================= */
function parsearNMEA(frase) {
    const texto = frase.trim();

    if (!texto.startsWith('$G')) return null;

    const partes = texto.split(',');

    /* =======================
       GPRMC (backup)
    ======================= */
    if (partes[0] === '$GPRMC' && partes.length > 6) {
        const lat = convertirADecimal(partes[3], partes[4]);
        const lon = convertirADecimal(partes[5], partes[6]);

        if (!lat || !lon) return null;

        return {
            latitude: lat,
            longitude: lon,
            tipo: 'GPRMC'
        };
    }

    /* =======================
       GPGGA (principal GPS)
    ======================= */
    if (partes[0].endsWith('GGA') && partes.length > 8) {

        const fix = parseInt(partes[6], 10);

        const lat = convertirADecimal(partes[2], partes[3]);
        const lon = convertirADecimal(partes[4], partes[5]);

        if (!lat || !lon) return null;

        return {
            latitude: lat,
            longitude: lon,
            satelites: parseInt(partes[7], 10) || 0,
            precision: parseFloat(partes[8]) || 0,
            fix,
            tipo: 'GGA'
        };
    }

    return null;
}

/* =========================
   CONVERSIÓN GPS
========================= */
function convertirADecimal(valor, direccion) {
    if (!valor || valor.length < 4) return null;

    const dotIndex = valor.indexOf('.');
    if (dotIndex === -1) return null;

    const grados = parseInt(valor.slice(0, dotIndex - 2), 10);
    const minutos = parseFloat(valor.slice(dotIndex - 2));

    if (isNaN(grados) || isNaN(minutos)) return null;

    let decimal = grados + minutos / 60;

    if (direccion === 'S' || direccion === 'W') {
        decimal *= -1;
    }

    return parseFloat(decimal.toFixed(8));
}