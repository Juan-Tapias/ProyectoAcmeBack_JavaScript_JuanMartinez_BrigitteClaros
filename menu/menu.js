const items = document.querySelector(".oculto");
const menu = document.getElementById("menu");

menu.addEventListener("click", () => {
  items.classList.replace("oculto", "boton-menu")
})