const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gpsElectron', {
    onCoordenadas: (callback) => {
        ipcRenderer.on('nuevas-coordenadas', (event, data) => {
            callback(data);
        });
    },
    onEstado: (callback) => {
        ipcRenderer.on('gps-estado', (event, data) => {
            callback(data);
        });
    },
    onNmeaRaw: (callback) => {
        ipcRenderer.on('nmea-raw', (event, data) => {
            callback(data);
        });
    },
    getGpsEstado: () => ipcRenderer.invoke('get-gps-estado'),
    getPuertos: () => ipcRenderer.invoke('get-puertos'),
    cambiarPuerto: (path) => ipcRenderer.send('cambiar-puerto', path)
});
