const browseSongSearch = document.getElementById("browseSongSearch");
const browseSongsTable = document.getElementById("browseSongsTable");
const browseSongSearchEmpty = document.getElementById("browseSongSearchEmpty");

// Adds a search event listener to the browse songs page
if (browseSongSearch && browseSongsTable && browseSongSearchEmpty) {
    // Collects all song rows in the table that have a data-song-title attribute
    const songRows = Array.from(browseSongsTable.querySelectorAll("tr[data-song-title]"));
    // Ignore case and trim whitespace for searching 
    browseSongSearch.addEventListener("input", function () {
        const query = this.value.trim().toLowerCase();
        let visibleRows = 0;
        // Loops through each song row and checks if the song title includes the search query
        songRows.forEach((row) => {
            const matches = row.dataset.songTitle.includes(query);
            row.hidden = !matches;
            // If the row matches the search query, increment the visibleRows count
            if (matches) {
                visibleRows += 1;
            }
        });
        // If no rows are visible, show the "No songs match that title" message; otherwise, hide it
        browseSongSearchEmpty.hidden = visibleRows !== 0;
    });
}
