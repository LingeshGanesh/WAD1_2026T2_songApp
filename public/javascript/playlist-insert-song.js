const insertBtn = document.getElementById("insertBtn");
const tbody = document.querySelector("tbody");
const emptySlot = document.getElementById("empty-slot");
const searchSongID = document.getElementById("searchSongID");
let songSelection = document.querySelector("input#songs");

// Add event listener if song rows exist (for playlist editing)
getSlotRows().forEach(slotRow => {
    const upBtn = slotRow.querySelector(".up");
    const downBtn = slotRow.querySelector(".down");
    const removeBtn = slotRow.querySelector(".remove");

    upBtn.addEventListener("click", moveRowUp);
    downBtn.addEventListener("click", moveRowDown);
    removeBtn.addEventListener("click", removeRow);
})
updateSongSelection()

// TODO: Add a pop-up dialog to insert a song.
insertBtn.addEventListener("click", async event => {
    event.preventDefault(); // Prevents button from submitting the form
    insertBtn.disabled = true;
    const newSlot = await createSlot()
    if (newSlot) {
        tbody.appendChild(newSlot);
    }
    
    showEmptySlot();
    updateSongSelection();
    setTimeout(() => {
        insertBtn.disabled = false;
    }, 1000);
});

// Action buttons method
function moveRowUp(event) {
    event.preventDefault();
    const tr = event.target.parentElement.parentElement;
    const rowNum = parseInt(tr.firstElementChild.innerText);

    // Reference: https://stackoverflow.com/questions/7742305/changing-the-order-of-elements
    // https://stackoverflow.com/a/78233036
    const upperRow = tr.previousElementSibling;
    
    if (upperRow.tagName.toString().toLowerCase() === "tr" && upperRow.id !== "empty-slot") {
        upperRow.insertAdjacentElement("beforebegin", tr);
        updateRowNum(rowNum - 1, rowNum);
    }
}

function moveRowDown(event) {
    event.preventDefault();
    const tr = event.target.parentElement.parentElement;
    const rowNum = parseInt(tr.firstElementChild.innerText);

    // Reference: https://stackoverflow.com/questions/7742305/changing-the-order-of-elements
    // https://stackoverflow.com/a/78233036
    const lowerRow = tr.nextElementSibling;
    
    if (lowerRow.tagName.toString().toLowerCase() === "tr") {
        lowerRow.insertAdjacentElement("afterend", tr);
        updateRowNum(rowNum, rowNum + 1);
    }

}

function removeRow(event) {
    event.preventDefault();
    const tr = event.target.parentElement.parentElement;
    const rowNum = parseInt(tr.firstElementChild.innerText);
    tr.remove();
    updateRowNum(rowNum);
    showEmptySlot();
}

// Extra methods
function updateRowNum(start, end = null) {
    if (end === null) {
        end = getSlotRows().length;
    }

    let childNodes = getSlotRows();

    for (let i = start; i <= end; i++) {
        childNodes.item(i - 1).firstElementChild.innerText = i.toString().padStart(2, "0");
    }

    updateSongSelection();
}

function showEmptySlot() {
    emptySlot.style.display = tbody.childElementCount > 1? "none": "table-row";
}

async function createSlot() {
    let song;
    try {
        const songProm = await fetch(`/song/search/${searchSongID.value.trim()}`);
        song = await songProm.json();
    } catch (error) {
        console.error(error);
        return;
    }

    let row = document.createElement("tr");
    let c_no = document.createElement("th");
    let c_song = document.createElement("td");
    let c_action = document.createElement("td");

    row.id = song._id;

    // fill the number cell
    c_no.innerText = (getSlotRows().length + 1).toString().padStart(2, "0");

    // fill the song cell
    let songAhref = document.createElement("a");
    songAhref.href = `/song/${song._id}`;
    songAhref.innerText = `${song.artist} - ${song.title}`;
    c_song.appendChild(songAhref)

    // fill the action cell
    let upBtn = document.createElement("button");
    upBtn.classList.add("up");
    upBtn.innerText = "↑"
    upBtn.addEventListener("click", moveRowUp);

    let downBtn = document.createElement("button");
    downBtn.classList.add("down");
    downBtn.textContent = "↓"
    downBtn.addEventListener("click", moveRowDown);

    let removeBtn = document.createElement("button");
    removeBtn.classList.add("remove");
    removeBtn.innerText = "−"
    removeBtn.addEventListener("click", removeRow);

    c_action.appendChild(upBtn);
    c_action.appendChild(downBtn);
    c_action.appendChild(removeBtn);

    // add cells into the row
    row.appendChild(c_no);
    row.appendChild(c_song);
    row.appendChild(c_action);

    return row;
}

function getSlotRows() {
    return document.querySelectorAll("tbody>tr:not(#empty-slot)");
}

function updateSongSelection() {
    let songIDs = [];

    getSlotRows().forEach(slotRow => {
        songIDs.push(slotRow.id);
    });

    songSelection.value = songIDs;
    console.log(songIDs);
}