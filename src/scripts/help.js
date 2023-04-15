export var modal = document.getElementById("myModal");
export var closeSpan = document.getElementById("closeSpan");

export function openModal() {
    modal.style.display = "block";
}

export function closeModal() {
    modal.style.display = "none";
}

closeSpan.onclick = closeModal