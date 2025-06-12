const items = document.querySelector(".oculto");
const menu = document.getElementById("menu");

menu.addEventListener("click", () => {
  if (items.classList.contains("oculto")) {
    items.classList.replace("oculto", "boton-menu");
  } else {
    items.classList.replace("boton-menu", "oculto");
  }
})