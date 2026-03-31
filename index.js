const {app, BrowserWindow, ipcMain,Menu} = require('electron')
const fs =require('fs/promises')
let home
let form

const notesFilePath = require('path').join(__dirname, "data", "notes.json");

// loading data from notes.json
async function readNotes() {
  try {
    const rawNotes = await fs.readFile(notesFilePath, "utf8");
    const parsedNotes = JSON.parse(rawNotes);
    return Array.isArray(parsedNotes.notes) ? parsedNotes.notes : [];
  } catch (error) {
    console.error("Failed to read notes.json:", error);
    return [];
  }
}

//writing data into notes.json
async function writeNotes(notes) {
  const payload = { notes: Array.isArray(notes) ? notes : [] };
  await fs.writeFile(notesFilePath, JSON.stringify(payload, null, 2), "utf8");
}

// creating Parent Window
function createHome () {
        home = new BrowserWindow({
        width:1200,
        height:800,
        backgroundColor: "#1f1f21",
        frame:false,
        autoHideMenuBar:true,
        webPreferences:{
            preload: require('path').join(__dirname, 'preload.js'), // bridge between renderer and main process
            nodeIntegration:false,
            contextIsolation:true
        }
    })
    home.loadFile("renderer/home/home.html")
}

// creating the form window (child window)
function createForm(mode = "create", selectedNoteId = null) {
    form = new BrowserWindow({
        parent: home,
        width: 800,
        height: 600,
        backgroundColor: "#1f1f21",
        frame: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: require('path').join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

   const queryObj = { mode: mode };
    if (selectedNoteId) {
        queryObj.noteId = selectedNoteId;
    }

    form.loadFile("renderer/form/form.html", { query: queryObj });
}

//minimize the home window
ipcMain.on("home-window-minimize", () => {
  if (home) home.minimize();
});

//maximize the home window
ipcMain.on("home-window-maximize-toggle", () => {
  if (!home) return;
  if (home.isMaximized()) home.unmaximize();
  else home.maximize();
});

//close the home window
ipcMain.on("home-window-close", () => {
  if (home) home.close();
});

//minimize the form window
ipcMain.on("form-window-minimize", () => {
  if (form) form.minimize();
});

//maximize the form window
ipcMain.on("form-window-maximize-toggle", () => {
  if (!form) return;
  if (form.isMaximized()) form.unmaximize();
  else form.maximize();
});

//close the home window
ipcMain.on("form-window-close", () => {
  console.log("form-window-close received");
  if(form) form.close();
});

//loading all the notes before loading the UI
ipcMain.handle("loadAllNotes", async () => {
  return await readNotes();
});

//editing the notes
ipcMain.handle("writeNotes", async (event, notes) => {
  await writeNotes(notes);
  return { success: true };
});

//opening the form window (create & edit)
ipcMain.on("open-form", (event,mode,selectedNoteId) => {
  
  createForm(mode, selectedNoteId)
})

//adding a new note data
ipcMain.handle('write-new-note', async (event, data) => {
    const nextNotes = Array.isArray(data) ? data : []

    await writeNotes(nextNotes)

    if (home) {
        home.webContents.send('notes-updated', nextNotes);
    }

    return { success: true };
});

// launching the application
app.whenReady().then(()=>{
    createHome()
    Menu.setApplicationMenu(null)
});