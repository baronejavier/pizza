const secciones = document.querySelectorAll("section");

document.addEventListener('contextmenu', event => event.preventDefault());

document.getElementById('consultarBtn').addEventListener('click', () => {
  const input = document.getElementById('whatsappInput');
  const numero = input.value.trim().replace(/\D/g,'');
  const resultado = document.getElementById('resultado');

  if (!numero || numero.length < 6) {
    resultado.textContent = "⚠️ Ingresá un número válido de WhatsApp.";
    resultado.className = "puntos-resultado error";
    return;
  }

  fetch('puntos.json?t=' + Date.now(), { cache: 'no-store' })
    .then(res => res.json())
    .then(data => {
      const cliente = data.find(c => String(c.whatsapp).replace(/\D/g,'') === numero);

      if (cliente) {
        if (cliente.puntos > 0) {
          resultado.textContent = `✅ Tenés $${cliente.puntos} en puntos acumulados.`;
          resultado.className = "puntos-resultado ok";
        } else {
          resultado.textContent = "ℹ️ Tenés $0 en puntos. ¡Sumá con tus próximas compras!";
          resultado.className = "puntos-resultado warn";
        }
      } else {
        resultado.textContent = "❌ No encontramos puntos asociados a este número.";
        resultado.className = "puntos-resultado error";
      }
    })
    .catch(() => {
      resultado.textContent = "Error al consultar puntos.";
      resultado.className = "puntos-resultado error";
    });
});

function procesarNumero() {
  function getNumero() {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("numero")) {
      return searchParams.get("numero");
    }

    const hash = window.location.hash;
    if (hash.includes("?")) {
      const hashQuery = hash.split("?")[1];
      const hashParams = new URLSearchParams(hashQuery);
      if (hashParams.has("numero")) {
        return hashParams.get("numero");
      }
    }

    return null;
  }

  const numero = getNumero();
  if (numero) {
    const input = document.getElementById("whatsappInput");
    const btn = document.getElementById("consultarBtn");

    if (input && btn) {
      input.value = numero;
      btn.click();
    }

    const seccion = document.getElementById("puntos");
    if (seccion) {
      seccion.scrollIntoView({ behavior: "smooth" });
    }
  }
}

window.addEventListener("DOMContentLoaded", procesarNumero);

window.addEventListener("hashchange", procesarNumero);
window.addEventListener("popstate", procesarNumero);