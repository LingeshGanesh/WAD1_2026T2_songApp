const selectedSongs = window.__initialSongs__ || []; // initialises selectedSongs array
// On the edit-album.ejs, window.__initialSongs__ is pre populated with album's existing songs from EJS
// On the add-album.ejs, window.__initialSongs__ is not called so selectedSongs starts off as an empty array

updateHidden(); // calls on page load and render those songs as tags and populate the hidden input
renderTags();

document.getElementById('songSearch').addEventListener('input', async function () { // fires everytime user types in search box
    const q = this.value.trim(); //gets the current search text
    const list = document.getElementById('songResults');
    if (!q) { list.style.display = 'none'; list.innerHTML = ''; return; } //if list is empty, hide the dropdown and stops

    // calls song-search route and gets matching songs as JSON objects
    const res = await fetch(`/album/song-search?q=${encodeURIComponent(q)}`); 
    const songs = await res.json();

    list.innerHTML = '';
    // Removes already selected songs so cannot add the same song twice
    const unselected = songs.filter(s => !selectedSongs.find(x => x._id === s._id.toString()));
    list.style.display = unselected.length ? 'block' : 'none';

    // Builds each song dropdown item as <li> 
    unselected.forEach(song => { 
        const li = document.createElement('li');
        li.textContent = `${song.title} - ${song.artist}`; 
        li.style.cssText = 'padding:6px 8px; cursor:pointer;';
        li.addEventListener('mouseenter', () => li.style.background = '#f0f0f0');  // Add hover highlight effect
        li.addEventListener('mouseleave', () => li.style.background = ''); 
        li.addEventListener('click', () => addSong(song)); // Clicking the item calls addSong(song)
        list.appendChild(li);
    });
});

function addSong(song) {
    selectedSongs.push(song); // adds the clicked song to the selectedSongs array
    updateHidden(); // updates the hidden input
    renderTags(); // re-renders the tags
    document.getElementById('songSearch').value = ''; // Clears search box
    document.getElementById('songResults').style.display = 'none'; //Hides the dropdown
}

function removeSong(id) { // When X is clicked on a tag
    const idx = selectedSongs.findIndex(s => s._id === id); // findIndex locates song in the array by its _id
    if (idx !== -1) selectedSongs.splice(idx, 1); // splice removes it from the array
    updateHidden(); // update hidden input
    renderTags(); // re-render the tags
}

// keeps the hidden <input name = "songs"> in sync with selectedSongs
// by joining all IDs with commas -> this is submitted with the form
function updateHidden() { 
    document.getElementById('songsHidden').value = selectedSongs.map(s => s._id).join(',');
}

// Redraws all selected songs as removable tags in the #selectedSongs div.
// Each tag has a X logo that calls removeSong when clicked
function renderTags() { 
    const container = document.getElementById('selectedSongs');
    container.innerHTML = '';
    selectedSongs.forEach(song => {
        const tag = document.createElement('span');
        tag.textContent = `${song.title} - ${song.artist}  `;
        const x = document.createElement('span');
        x.textContent = '✕';
        x.style.cursor = 'pointer';
        x.addEventListener('click', () => removeSong(song._id));
        tag.appendChild(x);
        tag.style.cssText = 'display:inline-block; margin:4px 4px 0 0; padding:3px 8px; background:#ddd; border-radius:12px; font-size:13px;';
        container.appendChild(tag);
    });
}

// Closes dropdown list when user clicks anywhere outside the search box or result list
document.addEventListener('click', e => {
    if (!e.target.closest('#songSearch') && !e.target.closest('#songResults')) {
        document.getElementById('songResults').style.display = 'none';
    }
});