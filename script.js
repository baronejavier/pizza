const secciones = document.querySelectorAll("section");

document.addEventListener('contextmenu', event => event.preventDefault());

const mostrarSeccion = () => {
  secciones.forEach((sec) => {
    const top = sec.getBoundingClientRect().top;
    if (top < window.innerHeight - 100) {
      sec.classList.add("visible");
    }
  });
};

window.addEventListener("scroll", mostrarSeccion);
window.addEventListener("load", mostrarSeccion);

document.addEventListener("DOMContentLoaded", () => {
  const precios = document.querySelectorAll("z");
  const mensajeEl = document.getElementById("mensaje");
  const contadorEl = document.getElementById("contador");

  const parsearPrecio = txt => {
    const limpio = String(txt).replace(/[^\d]/g, "");
    return limpio === "" ? NaN : parseInt(limpio, 10);
  };
  const formatear = n => "$" + n.toLocaleString("es-AR");

  function esHappyHour(h, m) {
    return (h >= 21 && h <= 23) || (h === 0 && m <= 0);
  }

  function segundosHasta(hActual, mActual, sActual, hTarget, mTarget, sTarget) {
    const ahoraSeg = hActual*3600 + mActual*60 + sActual;
    const targetSeg = hTarget*3600 + mTarget*60 + sTarget;
    if (targetSeg >= ahoraSeg) return targetSeg - ahoraSeg;
    return 24*3600 - ahoraSeg + targetSeg;
  }

  function actualizarPrecios() {
    const ahora = new Date();
    const h = ahora.getHours();
    const m = ahora.getMinutes();
    const inHH = esHappyHour(h, m);

    precios.forEach(precioEl => {
  if (!precioEl.hasAttribute("data-precio")) {
    const precioOriginal = parsearPrecio(precioEl.textContent);
    if (!isNaN(precioOriginal)) precioEl.setAttribute("data-precio", String(precioOriginal));
  }

  const precioBase = parseInt(precioEl.getAttribute("data-precio") || "", 10);
  if (isNaN(precioBase)) return;

  precioEl.innerHTML = "";

  if (inHH) {
    let aumento = Math.ceil((precioBase * 1.4) / 500) * 500;
    precioEl.innerHTML = `
      <span style="text-decoration: line-through; opacity:0.7; margin-right:5px">
        ${formatear(aumento)}
      </span>
      <span style="font-weight:bold; color:#00ff00">
        ${formatear(precioBase)}
      </span>`;
  } else {
    let nuevo = Math.ceil((precioBase * 1.4) / 500) * 500;
    precioEl.innerHTML = `
      ${formatear(nuevo)}
      <br>
      <small style="color:#ff6600">🎉 Eventos: ${formatear(precioBase)}</small>
    `;
  }
});

   }

  function actualizarContador() {
    const ahora = new Date();
    const h = ahora.getHours();
    const m = ahora.getMinutes();
    const s = ahora.getSeconds();
    const inHH = esHappyHour(h, m);

    if (mensajeEl && contadorEl) {
      let segs, hh, mm, ss;

      if (inHH) {
        mensajeEl.textContent = "¡Estamos en Happy Hour! 🎉 Pedí ahora — precios especiales hasta las 00:00.";
        segs = segundosHasta(h, m, s, 0, 0, 0);
      } else {
        mensajeEl.textContent = "⏳ El Happy Hour comienza todos los días a las 21:00. ¡No te lo pierdas!";
        segs = segundosHasta(h, m, s, 21, 0, 0);
      }

      hh = Math.floor(segs / 3600);
      mm = Math.floor((segs % 3600) / 60);
      ss = segs % 60;

      contadorEl.textContent = `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;

      if (segs <= 1) location.reload();
    }
  }

  actualizarPrecios();
  actualizarContador();
  setInterval(actualizarPrecios, 60_000);
  setInterval(actualizarContador, 1000);
});

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