// PARA BORRAR (rediseño, hallazgo #45): la onda tipo Material se reemplaza por
// la clase "presionable" de index.css. Ya no la usan Header ni Home (Fase 1).
// Siguen llamando a addRipple():
//   - src/components/ProductCard.jsx   → quitar en la Fase 3
//   - src/pages/ProductDetail.jsx      → quitar en la Fase 4 y borrar este archivo
//     junto con @keyframes ripple y .btn-ripple de animations.css.
// CartModal.jsx (Fase 5) y LoginModal.jsx (Fase 9) solo tienen la clase
// "btn-ripple", que sin esta función no hace nada.
export function addRipple(event) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const ripple = document.createElement("span");
  ripple.className = "ripple-effect";
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  button.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}
