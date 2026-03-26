const clearThumbBtn = document.getElementById("clear-thumb");
const fileField = document.querySelector("input[type='file']");

clearThumbBtn.addEventListener("click", event => {
    event.preventDefault();
    clearThumbBtn.disabled = true;
    fileField.value = null;
    setTimeout(() => {clearThumbBtn.disabled = false}, 1000);
});