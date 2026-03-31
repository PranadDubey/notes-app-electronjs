//Initializing all the dynamic/action html components
const minBtn = document.getElementById("minBtn")
const maxBtn = document.getElementById("maxBtn")
const closeBtn = document.getElementById("closeBtn")
const createNoteForm = document.getElementById("createNoteForm")
const noteTitle = document.getElementById("noteTitle")
const tag1 = document.getElementById("tag1")
const tag2 = document.getElementById("tag2")
const tag3 = document.getElementById("tag3")
const formWindowTitle = document.getElementById("formWindowTitle");
const formHeading = document.getElementById("formHeading");

//Initializing all the variables
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") || "create";
const noteId = params.get("noteId");

//minimize the form window
minBtn.addEventListener('click', ()=>{
    window.api.formWindowMinimize()
})

//maximize the form window
maxBtn.addEventListener('click', ()=>{
    window.api.formWindowMaximize()
})

//close the form window
closeBtn.addEventListener('click', ()=>{
    console.log("close clicked")
    window.api.formWindowClose()
})

//submitting the form and updating it in the notes.json and on the home page
createNoteForm.addEventListener("submit", async(event) => {
    event.preventDefault()

    const title = noteTitle.value.trim()
    if(!title) return

    const tags = [tag1.value,tag2.value,tag3.value]

    const existingNotes = await window.api.loadAllNotes();
    const maxId = existingNotes.reduce((m, n) => Math.max(m, Number(n.id) || 0), 0);

    const newNote = {
        id: maxId + 1,
        title,
        content: "",
        status: "Not Started",
        tags: tags
    };

    const updatedNotes = [newNote, ...existingNotes];
    const response = await window.api.writeNewNote(updatedNotes);

    if(response.success == true)
        window.api.formWindowClose();
})

//checking whether the intention of the opening the form window is for creating a new note or editing an existing one
if (mode === "edit") {
  formWindowTitle.textContent = "Edit Note";
  formHeading.textContent = "Edit Note";
  //prefilling the data when edit note form window is opening
  if (noteId) {
    window.api.loadAllNotes().then((existingNotes) => {
      const noteToEdit = existingNotes.find(n => String(n.id) === String(noteId));
      if (noteToEdit) {
        noteTitle.value = noteToEdit.title || "";
        
        const tags = noteToEdit.tags || [];
        if (tags[0]) tag1.value = tags[0];
        if (tags[1]) tag2.value = tags[1];
        if (tags[2]) tag3.value = tags[2];
      }
    });
  }
} else {
  formWindowTitle.textContent = "Create Note";
  formHeading.textContent = "Create New Note";
}