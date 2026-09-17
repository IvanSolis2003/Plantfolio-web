const VERSION = 2;
const CACHE_ESTATICO = `plantfolio-estatico-v${VERSION}`;
const CACHE_PAGINAS = `plantfolio-paginas-v${VERSION}`;
const CACHES_VALIDOS = [CACHE_ESTATICO, CACHE_PAGINAS];

const RECURSOS_BASE = ["/icon.png", "/manifest.webmanifest"];

const SIN_CONEXION = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sin conexión — Plantfolio</title></head>
<body style="margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#F8FAF9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1B4332;">
<div style="text-align:center;padding:24px;max-width:22rem;">
<h1 style="font-size:20px;margin:0 0 8px;">Sin conexión</h1>
<p style="margin:0 0 20px;color:#6B9E7A;line-height:1.6;">No pudimos cargar esta pantalla. Revisa tu conexión y vuelve a intentar.</p>
<button onclick="location.reload()" style="background:#2D6A4F;color:#fff;border:0;padding:12px 24px;border-radius:9px;font-size:15px;font-weight:600;">Reintentar</button>
</div></body></html>`;

function respuestaSinConexion() {
  return new Response(SIN_CONEXION, {
    status: 503,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE_ESTATICO)
      .then((cache) =>
        Promise.allSettled(RECURSOS_BASE.map((recurso) => cache.add(recurso)))
      )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(
          claves.filter((clave) => !CACHES_VALIDOS.includes(clave)).map((clave) => caches.delete(clave))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (evento) => {
  if (evento.data === "limpiar-paginas") {
    evento.waitUntil(caches.delete(CACHE_PAGINAS));
  }
});

function esInmutable(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/_next/image" ||
    /\.(png|jpg|jpeg|webp|svg|woff2?)$/i.test(url.pathname)
  );
}

function cacheFirst(peticion, nombreCache) {
  return caches.match(peticion).then((cacheada) => {
    if (cacheada) return cacheada;

    return fetch(peticion)
      .then((respuesta) => {
        if (respuesta.ok) {
          const copia = respuesta.clone();
          caches.open(nombreCache).then((cache) => cache.put(peticion, copia));
        }
        return respuesta;
      })
      .catch(() => Response.error());
  });
}

function networkFirstNavegacion(peticion) {
  return fetch(peticion)
    .then((respuesta) => {
      if (respuesta.ok) {
        const copia = respuesta.clone();
        caches.open(CACHE_PAGINAS).then((cache) => cache.put(peticion, copia));
      }
      return respuesta;
    })
    .catch(async () => {
      const cacheada = await caches.match(peticion, { cacheName: CACHE_PAGINAS });
      return cacheada ?? respuestaSinConexion();
    });
}

self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;
  const url = new URL(peticion.url);

  if (peticion.method !== "GET") {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.searchParams.has("_rsc")) {
    return;
  }

  if (peticion.mode === "navigate") {
    evento.respondWith(networkFirstNavegacion(peticion));
    return;
  }

  if (!esInmutable(url)) {
    return;
  }

  evento.respondWith(cacheFirst(peticion, CACHE_ESTATICO));
});
