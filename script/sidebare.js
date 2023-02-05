// Get Element
const btn_hide = document.querySelector("aside>.btn-hide");
const btn_show = document.querySelector(".btn-show");
const content = document.querySelector("section");
const side_bar = document.querySelector("aside");

btn_hide.onclick = () => hide();
btn_show.onclick = () => show();

function hide() {
    side_bar.classList.remove("show");
    content.classList.remove("sideBarShow");
}

function show() {
    side_bar.classList.add("show");
    content.classList.add("sideBarShow");
}