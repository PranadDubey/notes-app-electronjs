const { contextBridge, ipcRenderer } = require('electron');

//using context bridge from user to server for better security purposes
contextBridge.exposeInMainWorld('api', {
    homeWindowMinimize: () => ipcRenderer.send('home-window-minimize'),
    homeWindowMaximize: () => ipcRenderer.send('home-window-maximize-toggle'),
    homeWindowClose: () => ipcRenderer.send('home-window-close'),

    loadAllNotes: () => ipcRenderer.invoke("loadAllNotes"),
    writeNotes: (notes) => ipcRenderer.invoke("writeNotes", notes),

    openForm: (mode, selectedNoteId) => ipcRenderer.send("open-form",mode, selectedNoteId),

    formWindowMinimize: () => ipcRenderer.send('form-window-minimize'),
    formWindowMaximize: () => ipcRenderer.send('form-window-maximize-toggle'),
    formWindowClose: () => ipcRenderer.send('form-window-close'),
    writeNewNote: (notes) => ipcRenderer.invoke("write-new-note", notes),

    onFormUpdate : (callback) =>{
        ipcRenderer.on('notes-updated', (event, data) =>{
            console.log(data)
            callback(data)
        })
    },
});