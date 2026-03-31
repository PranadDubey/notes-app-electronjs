//Initializing all the dynamic/action html components
const minBtn = document.getElementById('minBtn')
const maxBtn = document.getElementById('maxBtn')
const closeBtn = document.getElementById('closeBtn')
const notesList = document.getElementById("notesList");
const editorPanel = document.getElementById("editorPanel");
const emptyState = document.getElementById("emptyState");
const noteTitleSpec = document.getElementById("noteTitle");
const noteTagsSpec = document.getElementById("noteTags");
const noteContentSpec = document.getElementById("noteContent");
const noteHeader = document.getElementById("noteHeader");
const newNoteBtn = document.getElementById("newNoteBtn")
const editBtn = document.getElementById("editBtn");
const sidebarResizer = document.getElementById("sidebarResizer");
const searchInput = document.getElementById("searchInput");

//Initializing all the variables
let notes = [];
let selectedNoteId = null;
let autoSaveTimer = null
let searchQuery = "";

//minimize the home window
minBtn.addEventListener('click', ()=>{
    window.api.homeWindowMinimize()
})

//maximize the home window
maxBtn.addEventListener('click', ()=>{
    window.api.homeWindowMaximize()
})

//close the home window
closeBtn.addEventListener('click', ()=>{
    window.api.homeWindowClose()
})

//opening the new note form
newNoteBtn.addEventListener("click", () =>{
  window.api.openForm("create")
})

//opening the edit form for an existing note data
editBtn.addEventListener("click", () => {
    window.api.openForm("edit", selectedNoteId);
});

//editing the note main-content
noteContentSpec.addEventListener("dblclick", () => {
  const selected = notes.find((n) => n.id === selectedNoteId)
  noteContentSpec.contentEditable = "true"
  noteContentSpec.classList.add("editing")
  noteContentSpec.focus()

  const range = document.createRange()
  range.selectNodeContents(noteContentSpec)
  range.collapse(false)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
})

//blur option to pause editing the note content
noteContentSpec.addEventListener("blur",() =>{
  noteContentSpec.contentEditable = "false"
  noteContentSpec.classList.remove("editing")
})

//triggered when user inputs
searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value || "";
  renderNotes();
});

//for the date and time functionality on the bottom of the left panel
function updateFooterDateTime() {
  const now = new Date();

  const dateText = now.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeText = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  });

  dateInfo.textContent = dateText;
  timeInfo.textContent = timeText;
}

updateFooterDateTime();
setInterval(updateFooterDateTime, 1000);

//auto-saving the data into notes.json every 600ms even while the user is editing
function scheduleAutoSave(){
  clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(async() =>{
    try{
      await window.api.writeNotes(notes)
    }
    catch(error){
      console.error("Auto-save failed: ", error)
    }
  },600)
}

function getSelectedNote() {
  return notes.find((n) => n.id === selectedNoteId);
}

noteContentSpec.addEventListener("input", () => {
  const selected = getSelectedNote();
  if (!selected) return;

  selected.content = noteContentSpec.textContent || "";
  scheduleAutoSave()
});

//filtering the notes based on titles when user searches
function getFilteredNotes(){
  const q = searchQuery.trim().toLowerCase()
  if(!q) return notes

  return notes.filter((note)=>{
    const title = String(note.title || "").toLowerCase()
    return title.includes(q)
  })
}

//rendering all the notes or filtered too
function renderNotes() {
  notesList.innerHTML = "";
  const filterNotes = getFilteredNotes()

  filterNotes.forEach((note) => {
    const li = document.createElement("li");
    li.className = "note-item";

    if (note.id === selectedNoteId) {
      li.classList.add("active");
    }

    const itemRow = document.createElement("div");
    itemRow.className = "note-item-row";

    const title = document.createElement("div");
    title.className = "note-title";
    title.textContent = note.title || "Untitled";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "note-delete-btn";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async (event) => {
      event.stopPropagation();
      const ok = confirm("Delete this note?")
      if(!ok) return

      await deleteNodeById(note.id)
    });

    itemRow.appendChild(title);
    itemRow.appendChild(deleteBtn);

    const tagsWrap = document.createElement("div");
    tagsWrap.className = "note-tags";

    const cleanTags = Array.isArray(note.tags)
      ? note.tags.map((t) => String(t).trim()).filter(Boolean)
      : [];

    cleanTags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "tag-chip";
      chip.textContent = tag;
      tagsWrap.appendChild(chip);
    });

    li.appendChild(itemRow);
    li.appendChild(tagsWrap);

    li.addEventListener("click", () => {
      selectedNoteId = note.id;
      renderNotes();
      renderSelectedNote();
    });

    notesList.appendChild(li);
  });
}

//rendering the selected note on the right half of the notes app
function renderSelectedNote() {
  const selected = notes.find((n) => n.id === selectedNoteId);

  if (!selected) {
    editorPanel.classList.add("no-selection");
    emptyState.style.display = "block";
    noteHeader.style.display = "none";
    noteContentSpec.style.display = "none";
    noteTagsSpec.style.display = "none";
    noteTagsSpec.innerHTML = "";
    noteTitleSpec.textContent = "";
    noteContentSpec.textContent = "";
    return;
  }

  editorPanel.classList.remove("no-selection");
  emptyState.style.display = "none";
  noteHeader.style.display = "flex";
  noteTagsSpec.style.display = "flex";
  noteTagsSpec.style.paddingTop = "1.5vh";
  noteContentSpec.style.display = "block";

  noteTitleSpec.textContent = (selected.title || "").trim() || "Untitled";
  noteContentSpec.textContent = selected.content || "";
  noteTagsSpec.innerHTML = "";

  const cleanTags = Array.isArray(selected.tags)
    ? selected.tags.map((t) => String(t).trim()).filter(Boolean)
    : [];

  cleanTags.forEach((tag) => {
    const chip = document.createElement("span");
    chip.className = "tag-chip";
    chip.textContent = tag;
    noteTagsSpec.appendChild(chip);
  });
}

window.api.onFormUpdate((updatedNotes) => {
  notes = Array.isArray(updatedNotes) ? updatedNotes : []
  selectedNoteId = null
  renderNotes()
  renderSelectedNote()
})

//delete a note data
async function deleteNodeById (noteId) {
  const nextNotes = notes.filter((n) => n.id !== noteId)

    const response = await window.api.writeNotes(nextNotes)

    notes = nextNotes
    if(selectedNoteId === noteId)
      selectedNoteId = null

    renderNotes()
  
}

// for the flexible left panel of the notes app
const rootStyle = document.documentElement.style;

const SIDEBAR_WIDTH_KEY = "notes.sidebar.width";
const SIDEBAR_MIN = 240;
const SIDEBAR_MAX = 520;

const savedWidth = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY));
if (!Number.isNaN(savedWidth) && savedWidth >= SIDEBAR_MIN && savedWidth <= SIDEBAR_MAX) {
  rootStyle.setProperty("--sidebar-w", `${savedWidth}px`);
}

let isResizing = false;

sidebarResizer.addEventListener("pointerdown", (event) => {
  isResizing = true;
  sidebarResizer.classList.add("dragging");
  sidebarResizer.setPointerCapture(event.pointerId);
  document.body.style.userSelect = "none";
});

sidebarResizer.addEventListener("pointermove", (event) => {
  if (!isResizing) return;

  const nextWidth = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, event.clientX));
  rootStyle.setProperty("--sidebar-w", `${nextWidth}px`);
});

function stopResizing() {
  if (!isResizing) return;
  isResizing = false;
  sidebarResizer.classList.remove("dragging");
  document.body.style.userSelect = "";

  const widthPx = getComputedStyle(document.documentElement).getPropertyValue("--sidebar-w").trim();
  const widthNum = Number(widthPx.replace("px", ""));
  if (!Number.isNaN(widthNum)) {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(widthNum));
  }
}

sidebarResizer.addEventListener("pointerup", stopResizing);
sidebarResizer.addEventListener("pointercancel", stopResizing);

// fetching all the notes in notes.json
async function loadNotes() {
  notes = await window.api.loadAllNotes();
  renderNotes();
}

// fetching all the notes before loading the UI
loadNotes();