//document Variables
const Create = document.getElementById("create");
const Delete = document.getElementById("delete");
const Cont = document.getElementById("cont");
const noteName = document.getElementById("noteName");
const Save = document.getElementById("save");
const notePad = document.getElementById("notePad");
const Main = document.getElementById("textField");
const Box = document.getElementById("box");
const Box2 = document.getElementById("box2");
const toDelete = document.getElementById("toDelete");
const newName = document.getElementById("newName");
const Cancel = document.getElementById("cancel");
const Cancel2 = document.getElementById("cancel2");
const Finalize = document.getElementById("finalize");

//Buttons
Create.addEventListener("click", Pop);
Delete.addEventListener("click", Pop2);
Cancel.addEventListener("click", unPop);
Cancel2.addEventListener("click", unPop2);
Finalize.addEventListener("click", render);
Save.addEventListener("click", saveNote);

//Data
let uniqueId = 0;
let Notes = [];
let Buttons = [];
let currentOpenedNoteId;
let currentNote;

loadNotesFromLocalStorage();
updateNotes();
//Memory
// --- NEW FUNCTION: saveNotesToLocalStorage ---
function saveNotesToLocalStorage() {
  localStorage.setItem("myNotesApp", JSON.stringify(Notes));
  localStorage.setItem("myNotesAppUniqueId", uniqueId.toString()); // Save uniqueId too
}

// --- NEW FUNCTION: loadNotesFromLocalStorage ---
function loadNotesFromLocalStorage() {
  const storedNotes = localStorage.getItem("myNotesApp");
  const storedUniqueId = localStorage.getItem("myNotesAppUniqueId");

  if (storedNotes) {
    Notes = JSON.parse(storedNotes);
    // Re-render all existing notes from the loaded array
    Notes.forEach((note) => {
      let li = document.createElement("li");
      li.id = note.Id;
      Cont.appendChild(li);

      let span = document.createElement("span");
      span.style.marginTop = "15px";
      li.appendChild(span);

      let p = document.createElement("li");
      p.id = note.Id + 0.5; // This ID might not be necessary if 'p' is just for display
      p.innerHTML = note.name;
      span.appendChild(p);

      span.addEventListener("click", function () {
        let allSpans = document.querySelectorAll("#cont li span");
        allSpans.forEach((s) => {
          s.classList.remove("openedNote");
        });
        this.classList.add("openedNote");
        const clickedNoteId = parseInt(this.parentElement.id);
        currentOpenedNoteId = clickedNoteId;
        updateNotes(clickedNoteId);
      });
    });
  }

  if (storedUniqueId) {
    uniqueId = parseInt(storedUniqueId);
  }
  // If no notes are stored, Notes remains an empty array, and uniqueId remains 0.
}

//Complex Listeners
function Pop() {
  Main.style.display = "none";
  Box.style.display = "block";
  Box2.style.display = "none";
  document.getElementById("newName").focus();
}

function Pop2() {
  Main.style.display = "none";
  updateDeleteList();
  Box2.style.display = "block";
  Box.style.display = "none";
}

function unPop() {
  Box.style.display = "none";
}

newName.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    Finalize.click();
  }
});

notePad.addEventListener("keydown", function (event) {
  // Check if the pressed key is 'Enter'
  if (event.ctrlKey) {
    event.preventDefault(); // Prevent default form submission if applicable
    Save.click(); // Programmatically click the button
  }
});

function unPop2() {
  Box2.style.display = "none";
}

function render() {
  if (newName.value == "") {
    alert("Please enter a valid name");
  } else {
    let New = newName.value;
    let newId = assignUniqueId();
    Box.style.display = "none";
    Notes.push({ Id: newId, name: New, Note: "" });
    newName.value = "";
    // Time to create pad
    let li = document.createElement("li");
    li.id = newId;
    Cont.appendChild(li);

    let span = document.createElement("span");
    span.style.marginTop = "15px";
    li.appendChild(span);

    let p = document.createElement("li");
    p.id = newId + 0.5;
    p.innerHTML = New;
    span.appendChild(p);

    console.log(Notes);

    span.addEventListener("click", function () {
      let allSpans = document.querySelectorAll("#cont li span");

      // 2. Loop through all of them and remove the 'openedNote' class
      allSpans.forEach((s) => {
        s.classList.remove("openedNote");
      });

      // 3. Add the 'openedNote' class to the clicked 'span' element
      this.classList.add("openedNote");

      const clickedNoteId = parseInt(this.parentElement.id); // Get the ID from <li> and convert to number
      currentOpenedNoteId = clickedNoteId; // Store the ID of the currently opened note
      updateNotes(clickedNoteId); // Pass the actual unique ID to updateNotes
    });

    saveNotesToLocalStorage();
    updateDeleteList();
    document.getElementById(newId).querySelector("span").click();
  }
}

function updateNotes(selectedNoteUniqueId) {
  // Find the note object in the Notes array using its unique ID
  const selectedNote = Notes.find((note) => note.Id === selectedNoteUniqueId);

  if (!selectedNote) {
    // If no note is found (e.g., array is empty or ID doesn't match)
    Main.style.display = "none";
    noteName.innerHTML = "";
    notePad.value = "";
    currentOpenedNoteId = null; // Clear the opened note ID
    return;
  }

  Main.style.display = "block";
  noteName.innerHTML = selectedNote.name;
  currentNote = selectedNote.Id;
  notePad.value = selectedNote.Note;
}

function updateDeleteList() {
  toDelete.innerHTML = "";
  Notes.forEach((note) => {
    let deLi = document.createElement("li");
    toDelete.appendChild(deLi);

    let deB = document.createElement("button");
    deB.innerHTML = note.name;
    deB.id = note.Id; // Use the actual note ID for the button
    deLi.appendChild(deB);

    deB.addEventListener("click", () => {
      let userConfirmed = confirm(
        `Are you sure you want to delete "${note.name}"?`
      );

      if (!userConfirmed) {
        unPop2();
      } else if (userConfirmed) {
        deLi.remove(); // Remove the entire list item

        // 2. Find the index of the note in the Notes array based on its unique ID
        const indexToRemove = Notes.findIndex((item) => item.Id === note.Id);

        // 3. If found, remove it from the Notes array
        if (indexToRemove > -1) {
          Notes.splice(indexToRemove, 1);
        }

        console.log("Updated Notes array:", Notes);

        // OPTIONAL: If you want to update the main display (Cont) immediately
        // This is important if you delete a note and expect it to disappear from the main list.
        const mainListItem = document.getElementById(note.Id);
        if (mainListItem) {
          mainListItem.remove();
        }

        saveNotesToLocalStorage();

        if (currentOpenedNoteId === note.Id) {
          Main.style.display = "none";
          noteName.innerHTML = "";
          notePad.value = "";
          currentOpenedNoteId = null;
        }

        // Hide the delete box if all notes are deleted
        if (Notes.length === 0) {
          unPop2(); // Call unPop2 to hide the delete box
        }
      }
    });
  });
}

function saveNote() {
  const noteToSave = Notes.find((note) => note.Id === currentOpenedNoteId);
  if (noteToSave) {
    noteToSave.Note = notePad.value;
    saveNotesToLocalStorage(); // --- SAVE AFTER EDITING A NOTE ---
  }
}

function assignUniqueId() {
  uniqueId++;
  return uniqueId;
}
