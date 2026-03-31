const selectedSongs = window.__initialSongs__ || [];

updateHidden();
renderTags();

document.getElementById('songSearch').addEventListener('input', async function () {
    const q = this.value.trim();
    const list = document.getElementById('songResults');
    if (!q) { list.style.display = 'none'; list.innerHTML = ''; return; }

    const res = await fetch(`/album/song-search?q=${encodeURIComponent(q)}`);
    const songs = await res.json();

    list.innerHTML = '';
    const unselected = songs.filter(s => !selectedSongs.find(x => x._id === s._id.toString()));
    list.style.display = unselected.length ? 'block' : 'none';

    unselected.forEach(song => {
        const li = document.createElement('li');
        li.textContent = `${song.title} - ${song.artist}`;
        li.style.cssText = 'padding:6px 8px; cursor:pointer;';
        li.addEventListener('mouseenter', () => li.style.background = '#f0f0f0');
        li.addEventListener('mouseleave', () => li.style.background = '');
        li.addEventListener('click', () => addSong(song));
        list.appendChild(li);
    });
});

function addSong(song) {
    selectedSongs.push(song);
    updateHidden();
    renderTags();
    document.getElementById('songSearch').value = '';
    document.getElementById('songResults').style.display = 'none';
}

function removeSong(id) {
    const idx = selectedSongs.findIndex(s => s._id === id);
    if (idx !== -1) selectedSongs.splice(idx, 1);
    updateHidden();
    renderTags();
}

function updateHidden() {
    document.getElementById('songsHidden').value = selectedSongs.map(s => s._id).join(',');
}

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

document.addEventListener('click', e => {
    if (!e.target.closest('#songSearch') && !e.target.closest('#songResults')) {
        document.getElementById('songResults').style.display = 'none';
    }
});