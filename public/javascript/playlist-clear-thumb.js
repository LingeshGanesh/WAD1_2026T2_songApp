/**
 * Included in:
 * - /views/playlists/create-form.ejs
 * - /views/playlists/edit-form.ejs
 */

const clearThumbBtn = document.getElementById("clear-thumb");
const fileField = document.querySelector("input[type='file']");
const editThumb = document.getElementById("editThumb");
const thumbFrame = document.getElementById("thumb-frame");

if (editThumb) {
    editThumb.addEventListener("click", event => {
        const showFrame = editThumb.checked;
        thumbFrame.style.display = showFrame? "block": "none";
    })
    thumbFrame.style.display = "none";
}

clearThumbBtn.addEventListener("click", event => {
    event.preventDefault();
    clearThumbBtn.disabled = true;
    fileField.value = null;
    setTimeout(() => {clearThumbBtn.disabled = false}, 1000);
});