@AGENTS.md

# 🌿 Plantfolio Web — CLAUDE.md

> Memoria persistente del proyecto. Se carga automáticamente en cada sesión.

---

## 📌 Identidad del Proyecto

| Campo | Valor |
|---|---|
| **Nombre** | Plantfolio |
| **Tipo** | PWA — Coleccionista de plantas (identificación por IA, álbum, mapa de hallazgos) |
| **Desarrollador** | Iván Solís Manqueo |
| **Ubicación** | Talca, Región del Maule, Chile |
| **Estado** | Sprint 1-4 + cuentas con aprobación de admin + privacidad + landing pública + ficha de detalle multi-foto + perfil personalizable con ubicación aproximada, todo verificado en producción (falta solo notificaciones push). |
| **Producción** | https://plantfolio-web.vercel.app |

Existió primero como app Android nativa (Expo/React Native + backend Express
separado). Se migró a PWA en Next.js siguiendo el mismo patrón que **RutinIA**
(monolito Next.js + Prisma directo, sin backend separado). El repo `plantfolio`
(Expo) sigue existiendo pero es **una pista aparte, independiente** — no se
sincroniza con este proyecto. `plantfolio-api` (Express) queda como referencia
histórica de la lógica que hay que portar, pero ya no corre en producción ni lo
usa esta app.

---

## 🗂️ Estructura del repo (plantfolio-web)

```
app/
├── entrar/              ← login (page.tsx + FormularioEntrar.tsx cliente)
├── registro/            ← registro (page.tsx + FormularioRegistro.tsx cliente)
├── perfil/              ← perfil + logout + estadísticas reales (BotonSalir.tsx cliente)
├── album/               ← listar/buscar/filtrar/borrar (AlbumCliente.tsx cliente)
│   └── [id]/             ← ficha de detalle: fotos (máx 3) + nota libre (DetalleCliente.tsx)
├── escanear/            ← identificar + agregar al álbum (FormularioEscanear.tsx cliente)
├── mapa/                ← mapa Leaflet con marcadores (MapaCliente.tsx + MapaLeaflet.tsx)
├── api/auth/            ← route handlers: login, registro, logout, me
├── api/identify/        ← PlantNet + Cloudinary + upsert de Plant
├── api/album/           ← GET/POST + DELETE/PATCH [id] + GET mapa
├── api/clima/           ← alerta de riego según OpenWeather
├── api/admin/aprobar/   ← solo esAdmin, habilita una cuenta
├── api/perfil/privacidad/ ← toggle de coleccionPrivada
├── api/perfil/           ← PATCH bio/ubicacionTexto/compartirPerfil
├── api/perfil/avatar/    ← sube foto de perfil a Cloudinary
├── admin/               ← panel de cuentas (page.tsx + BotonAprobar.tsx), notFound() si no es admin
├── verificar/            ← resuelve el token de verificación de email
├── galeria/              ← pública, sin login, álbum de todos salvo lo marcado privado
│   └── [id]/             ← ficha pública de una planta: ubicación siempre visible, perfil solo si compartirPerfil
├── catalogo/             ← pública, buscador de las especies del catálogo (CatalogoCliente.tsx, GET /api/plants)
├── api/plants/           ← GET público, catálogo completo (consumido por /catalogo)
├── api/plantas/manual/   ← POST, busca o crea una Plant por nombre escrito a mano
├── LandingPublica.tsx    ← lo que ve un visitante sin sesión en / (hero + preview de galería)
├── AlertaRiego.tsx       ← cliente, pide geolocalización best-effort, se muestra en Inicio
├── PlantasPorRegar.tsx   ← cliente, lista de plantas que necesitan riego hoy, se muestra en Inicio
├── layout.tsx           ← resuelve sesión server-side, PWA, React Query
├── manifest.ts           ← manifest de PWA
├── registrar-sw.tsx      ← registra el service worker (solo producción)
└── page.tsx              ← Inicio
components/               ← EstadoConexion, BarraInferior (5 tabs), RarityBadge, HeaderPublico, VisorFoto
lib/
├── prisma.ts             ← PrismaClient + adapter de Neon
├── sesion.ts             ← sesión en BD (crearSesion/cerrarSesion/obtenerUsuarioServidor/obtenerUsuarioId)
├── cuentas.ts            ← estadoDe/nuevoToken/vencimiento/tokenVigente (igual que RutinIA)
├── correo.ts             ← Resend + plantillas de verificación/aprobación
├── plantnet.ts           ← identifica especie, mapea confianza→rareza
├── cloudinary.ts         ← sube foto, devuelve solo la URL
├── clima.ts              ← alerta de riego según humedad/temperatura
├── geocoding.ts          ← reverse geocoding con Nominatim, coordenadas redondeadas
├── logros.ts             ← calcula logros al vuelo desde el álbum (sin tabla nueva)
├── desafios.ts           ← desafíos por temporada meteorológica, mismo criterio que logros.ts
├── floraNativaChile.ts   ← lista curada de especies nativas, usada al identificar y en búsqueda manual
├── imagenCliente.ts      ← recodifica cualquier foto a JPEG (canvas) antes de subirla, evita el bug de HEIC
├── riego.ts              ← diasDesdeUltimoRiego/necesitaRiego, funciones puras usables en server y client
├── validar.ts            ← parsearBody(req, schema) con Zod, usado en todos los route handlers con body
└── exportarCsv.ts        ← exporta el álbum a CSV Darwin Core (GBIF/iNaturalist), 100% cliente
store/authStore.ts        ← Zustand, solo el usuario (no el token)
prisma/
├── schema.prisma          ← modelos de datos
└── seed.ts                ← 18 especies reales de flora nativa chilena
public/sw.js               ← service worker (assets + páginas del álbum en cache, fallback offline)
```

---

## ⚙️ Stack Tecnológico

- **Next.js 16** (App Router) + **React 19** — todo resuelto en el mismo proyecto, sin backend externo
- **Tailwind v3** — mismos colores del diseño original (`primary #2D6A4F`, `accent #B7E4C7`, `rare.*` para `RarityBadge`)
- **Prisma 7** + **@prisma/adapter-neon** — Prisma 7 exige un driver adapter, ya no acepta URL directa en el schema ni en el constructor de `PrismaClient`
- **Zustand** — solo guarda el `user` ya resuelto server-side, nunca el token
- **TanStack React Query** — disponible vía `QueryProvider`, listo para cuando se conecten datos reales (álbum, mapa)
- **bcryptjs** — hashing de contraseñas (compatible con los hashes que ya creó `plantfolio-api`)
- **Sesión en cookie httpOnly + tabla `auth_sessions`** — no JWT. Mismo patrón que RutinIA (`lib/sesion.ts`)

### Servicios externos
| Servicio | Uso | Estado |
|---|---|---|
| **PlantNet API** | Identificación de plantas por foto | ✅ Configurado (`PLANTNET_API_KEY`) |
| **Cloudinary** | Storage de imágenes (solo guardar la URL) | ✅ Configurado |
| **Neon.tech** | PostgreSQL | ✅ Configurado |
| **OpenWeather API** | Alertas de riego según clima | ✅ Configurado (`OPENWEATHER_API_KEY`) |
| **Resend** | Correo de verificación de cuenta y aviso de aprobación | ✅ Configurado — reusa la misma key de RutinIA (`hola@iasmtech.com` ya verificado), remitente distinto (`Plantfolio <hola@iasmtech.com>`) |

⚠️ **No es Plant.id.** El plan original y el CLAUDE.md viejo mencionaban Plant.id,
pero pasó a ser un producto B2B sin free tier self-service claro. Se cambió a
**PlantNet** (`my.plantnet.org`, gratis para uso no comercial). La respuesta de
PlantNet es distinta: `results[0].species.scientificNameWithoutAuthor`,
`.commonNames[0]`, `.family.scientificNameWithoutAuthor` — no reusar la forma de
respuesta de Plant.id si se encuentra documentación vieja de `plantfolio-api`.

---

## 🗃️ Modelos de Datos (Prisma) — ya migrados en Neon

```prisma
enum Rarity {
  COMUN
  POCO_COMUN
  ENDEMICA
  PROTEGIDA
  CASI_EXTINTA
}

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  password          String
  name              String
  createdAt         DateTime  @default(now())
  emailVerificado   DateTime?
  tokenVerificacion String?   @unique
  tokenExpira       DateTime?
  tokenReset        String?   @unique
  tokenResetExpira  DateTime?
  aprobado          Boolean   @default(false)
  esAdmin           Boolean   @default(false)
  coleccionPrivada  Boolean   @default(false)
  bio               String?
  avatarUrl         String?
  ubicacionTexto    String?
  compartirPerfil   Boolean   @default(false)
  sessions  AuthSession[]
  entries   CollectionEntry[]
  logs      IdentificationLog[]
}

model AuthSession {
  id        String   @id
  userId    String
  createdAt DateTime @default(now())
  expiraEn  DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Plant {
  id               String   @id @default(cuid())
  commonName       String
  scientificName   String   @unique
  family           String?
  description      String?
  rarity           Rarity   @default(COMUN)
  careInstructions String?
  diseases         String?
  nativeToChile    Boolean  @default(false)
  wateringFrequencyDays Int @default(7)
  entries          CollectionEntry[]
}

model CollectionEntry {
  id           String   @id @default(cuid())
  userId       String
  plantId      String
  photos       String[]
  photoDates   DateTime[] @default([])
  notes        String?
  latitude     Float?
  longitude    Float?
  ubicacionAprox String?
  privado      Boolean  @default(false)
  identifiedAt DateTime @default(now())
  lastWatered  DateTime?
  version      Int      @default(0)
  user         User     @relation(fields: [userId], references: [id])
  plant        Plant    @relation(fields: [plantId], references: [id])
}

model IdentificationLog {
  id          String   @id @default(cuid())
  userId      String
  photoUrl    String
  apiResponse Json
  confidence  Float
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}
```

La tabla `plants` ya tiene 18 especies nativas chilenas sembradas
(`prisma/seed.ts`, correr con `npx prisma db seed`) más lo que se va
identificando (`/api/identify` hace `upsert` por `scientificName`, así que
correr el seed de nuevo no duplica nada).

---

## 🔌 Endpoints (Route Handlers de Next.js)

| Método | Ruta | Descripción | Estado |
|---|---|---|---|
| POST | `/api/auth/registro` | Registro → crea sesión en BD | ✅ |
| POST | `/api/auth/login` | Login → crea sesión en BD | ✅ |
| POST | `/api/auth/logout` | Borra sesión | ✅ |
| POST | `/api/auth/reenviar-verificacion` | `{ email }` — reenvía el correo si no está verificado (throttle 1h) | ✅ |
| POST | `/api/auth/olvide-password` | `{ email }` — manda enlace de reseteo si el correo existe (throttle 1h) | ✅ |
| POST | `/api/auth/restablecer` | `{ token, password }` — valida el token, hashea la contraseña, invalida todas las sesiones | ✅ |
| GET | `/api/auth/me` | Usuario autenticado actual | ✅ |
| POST | `/api/identify` | Envía foto a PlantNet + Cloudinary + upsert de Plant | ✅ |
| GET/POST | `/api/album` | Álbum del usuario (POST reusa la foto que ya subió identify, no resube) | ✅ |
| DELETE | `/api/album/:id` | Eliminar entrada (chequea ownership) | ✅ |
| PATCH | `/api/album/:id` | `{ privado?, notes?, regada? }` — actualiza lo que venga (chequea ownership); `regada: true` fija `lastWatered` a la fecha del servidor | ✅ |
| POST | `/api/album/:id/fotos` | Agrega una foto (máx 3, sube a Cloudinary) | ✅ |
| DELETE | `/api/album/:id/fotos` | Saca una foto por URL (mín 1) | ✅ |
| GET | `/api/album/mapa` | Entradas con GPS, para el mapa Leaflet | ✅ |
| GET | `/api/clima` | Alerta de riego (requiere `?lat=&lon=`) | ✅ |
| POST | `/api/admin/aprobar` | Habilita una cuenta (solo `esAdmin`) | ✅ |
| POST | `/api/perfil/privacidad` | Toggle de `coleccionPrivada` | ✅ |
| PATCH | `/api/perfil` | `{ bio?, ubicacionTexto?, compartirPerfil? }` | ✅ |
| POST | `/api/perfil/avatar` | Sube avatar a Cloudinary | ✅ |
| GET | `/api/plants` | Catálogo completo, público (sin auth) — usado por `/catalogo` | ✅ |
| POST | `/api/plantas/manual` | Busca por nombre (común o científico) y crea la planta si no existe | ✅ |

Todos se implementan como Route Handlers con Prisma directo — **no existe
un backend separado al que llamar.**

---

## 👤 Cuentas: verificación + aprobación de admin (igual que RutinIA)

RutinIA usa un flujo de 3 estados (`lib/cuentas.ts` → `estadoDe`), portado tal
cual:

1. **`sin-verificar`** — se registró pero no confirmó el correo
2. **`esperando-aprobacion`** — confirmó el correo, falta que un admin lo habilite
3. **`lista`** — puede entrar

`POST /api/auth/registro` crea el `User` con `tokenVerificacion` +
`tokenExpira` (24h) y manda el correo de verificación — **no crea sesión ni
loguea automático**, distinto de antes. `GET /verificar?token=...` resuelve el
token y marca `emailVerificado`. `POST /api/auth/login` valida la contraseña
primero y **recién después** mira el estado (para no filtrarle a un
desconocido si una cuenta existe según el mensaje de error) — si no está
`lista`, bloquea con `MENSAJE_POR_ESTADO[estado]`.

`esAdmin` no lo puede poner nadie desde la UI — se activa a mano en la base.
`ivan.solis20.m@gmail.com` quedó como el primer admin porque no había nadie
más que lo aprobara. `/admin` (`app/admin/page.tsx`) hace `notFound()` si
`!esAdmin`, lista todas las cuentas y deja aprobar las que están
`esperando-aprobacion`.

**Lo que NO se portó de RutinIA** (fuera de alcance, no lo pidió el usuario):
rate limiting por IP/correo (`lib/limites.ts` + modelo `Intento`),
recuperación de contraseña, reenvío de verificación, revocar/eliminar cuenta.
Si hace falta, el patrón ya existe en `RutinIA/app/admin/acciones.ts` y
`RutinIA/lib/limites.ts` para copiar.

## 🔓 Privacidad: colecciones públicas por defecto

`/galeria` es una pantalla **sin login** que lista `CollectionEntry` de
todos los usuarios (`privado: false` y `user.coleccionPrivada: false`), con
CTA de entrar/registrarse para visitantes anónimos. Cada usuario controla su
propia privacidad en dos niveles — **no es el admin quien la marca**:

- **Por planta:** botón 🔒 en cada tarjeta del álbum (`AlbumCliente.tsx`),
  `PATCH /api/album/:id { privado }`
- **Por colección completa:** toggle en Perfil (`ToggleColeccionPrivada.tsx`),
  `POST /api/perfil/privacidad { coleccionPrivada }` — oculta todo el álbum
  del usuario de la galería sin tocar el flag de cada entrada individual

`/galeria/:id` es la ficha pública de una planta (sin login, solo si la entrada
es visible según las reglas de arriba). Dos niveles de información, con
umbrales de privacidad distintos:

- **Ubicación aproximada de la planta — siempre visible**, sin opt-in. Se
  resuelve **una sola vez**, al guardar en el álbum (`POST /api/album` llama a
  `lib/geocoding.ts` → Nominatim/OpenStreetMap con las coordenadas redondeadas
  a 2 decimales, ~1km de precisión, para no revelar una dirección exacta), y
  queda cacheada en `CollectionEntry.ubicacionAprox` — nunca se re-consulta al
  mostrar la ficha.
- **Datos de la persona (bio, foto, ciudad) — solo si `User.compartirPerfil`
  es `true`.** Es opt-in, default `false`. Se edita en `EditarPerfil.tsx`
  (`/perfil`), `PATCH /api/perfil { bio, ubicacionTexto, compartirPerfil }` +
  `POST /api/perfil/avatar` para la foto (sube a Cloudinary, mismo patrón que
  las fotos de plantas).

⚠️ No confundir `CollectionEntry.ubicacionAprox` (de la planta, siempre
pública) con `User.ubicacionTexto` (de la persona, gateada por
`compartirPerfil`) — son campos distintos con reglas de visibilidad distintas
a propósito, verificado con valores diferentes en cada uno para confirmar que
no se mezclan en la ficha pública.

---

## 🌿 Flujo de Identificación IA (Sprint 2-3 — implementado)

El plan original (`docs` nunca creados de `plantfolio-api`) tenía un hueco: el
paso de identificar nunca creaba el `Plant` en el catálogo, así que
`POST /api/album` fallaba con "planta no encontrada" porque exigía un
`plantId` que no existía. Flujo tal como quedó implementado:

1. Usuario abre **Escanear**, toma foto con `<input type="file" accept="image/*">` o la sube desde galería (sin `capture`, ver trampa más abajo)
2. Foto se normaliza a JPEG base64 en el cliente (`archivoAJpegBase64` en `lib/imagenCliente.ts`, recodifica vía canvas para evitar problemas de formato con HEIC de iPhone y comprime a 1600px máx)
3. `POST /api/identify` recibe el base64, corre **en paralelo** (`Promise.all`)
   `identificarPlanta()` (PlantNet) y `subirImagen()` (Cloudinary) — importante en
   Vercel, donde el límite de duración por defecto es más corto que hacerlas en
   secuencia (ver `maxDuration = 60` en el route handler)
4. PlantNet responde **hasta 3 especies candidatas** (no solo la más probable —
   error real que se corrigió: al principio solo se usaba `results[0]`, pero el
   usuario probó con una foto ambigua y no daba opción de elegir otra si la
   primera estaba mal)
5. El handler hace `prisma.plant.upsert({ where: { scientificName }, ... })`
   **para cada una de las 3 candidatas en paralelo** antes de responder, así
   las 3 ya tienen `plantId` válido sin importar cuál elija el usuario
6. Se guarda un `IdentificationLog` con la respuesta cruda y la confianza de la
   mejor candidata, y se devuelve `{ photoUrl, candidatos: [...] }` al cliente
7. Usuario ve las 3 opciones con nombre, `RarityBadge` y % de coincidencia, y
   elige una (estado local, sin llamada al servidor); si ninguna es correcta,
   "Ninguna es correcta — volver a intentar" resetea todo para subir otra foto
8. Al confirmar la elegida, `POST /api/album` crea el `CollectionEntry`
   **reusando el mismo `photoUrl`** (no vuelve a subir la foto a Cloudinary) y
   captura GPS best-effort con `navigator.geolocation` (si el usuario niega el
   permiso, se guarda sin coordenadas, no bloquea)
9. Si ninguna de las 3 coincide, debajo del botón de reintentar hay un campo
   para escribir el nombre a mano — `POST /api/plantas/manual` busca por
   `commonName` o `scientificName` (sin distinguir mayúsculas) y crea la
   planta si no existe, con `rarity` en `COMUN` y `nativeToChile` calculado
   con la misma lista curada que usa la identificación por cámara
   (`lib/floraNativaChile.ts`). Reusa el `photoUrl` ya subido, igual que al
   elegir una de las 3 candidatas — no hay una segunda subida a Cloudinary.
10. Al elegir una candidata (de las 3 o de la búsqueda manual), hay dos
    botones: "Agregar al álbum" (llama a `POST /api/album`, como siempre) y
    "Solo identificar" (no llama a ningún endpoint nuevo, solo muestra la
    especie elegida en pantalla). Esta segunda opción **no crea un
    `CollectionEntry`**, así que no aparece en el álbum, ni en el mapa, ni
    cuenta para logros — pensado para identificar una planta que no es
    propia (de un amigo, en la calle) sin que quede en la colección
    personal. El `Plant` del catálogo y el `IdentificationLog` sí se crean
    igual que siempre, porque eso ya pasa en `/api/identify` antes de elegir
    qué hacer con el resultado.

## ⚠️ Trampa: `nativeToChile` siempre en `false` para especies nuevas

PlantNet no informa si una especie es nativa de Chile, así que el campo
`nativeToChile` de una `Plant` recién creada por `POST /api/identify`
dependía por completo de que esa especie ya existiera en la base (el
`upsert` con `update: {}` preserva el valor si ya está, pero al crearla por
primera vez no había forma de saberlo, y quedaba en `false` para siempre —
las 18 especies de `prisma/seed.ts` estaban bien porque ya existían antes de
que nadie las escaneara, pero cualquier otra nativa real quedaba mal
marcada). Fix: `lib/floraNativaChile.ts` tiene una lista curada (ampliación
de las 18 sembradas) que `identificarPlanta()` en `lib/plantnet.ts` consulta
para calcular `nativeToChile` en el momento de identificar, no solo cuando
ya está en Postgres. Mismo espíritu que el fix de `rarity` (evitar inventar
el dato desde una señal que no lo tiene — PlantNet en ambos casos — usando
datos curados en vez de una API externa nueva). Si se agrega una especie
nativa que falte, sumarla al `Set` de `lib/floraNativaChile.ts`.

## 🌱 Cuidados y plagas por especie

`Plant.careInstructions` y `Plant.diseases` existían en el schema desde el
principio pero nunca se poblaban ni se mostraban en ninguna pantalla. Se
completaron para las 18 especies de `prisma/seed.ts` con texto práctico en
español (riego, luz, suelo, plagas/enfermedades comunes) y se agregó la
sección "Cuidados" / "Plagas y enfermedades comunes" en `DetalleCliente.tsx`
(ficha privada) y `app/galeria/[id]/page.tsx` (ficha pública), renderizada
condicionalmente solo si el dato existe. Especies identificadas por cámara
que no están en la lista curada quedan sin estos campos (`null`) hasta que
se agreguen a mano en `seed.ts` — no hay generación automática de este
contenido. El `upsert` del seed ahora actualiza estos campos en cada
ejecución (`update: { ...planta, nativeToChile: true }`, ya no `update: {}`)
para poder corregir o ampliar el texto sin tener que borrar la fila a mano;
correr `npx prisma db seed` después de editar `FLORA_CHILENA` para que los
cambios lleguen a producción (misma base que dev, ver sección de Prisma).

## 💧 Recordatorios de riego reales

`AlertaRiego` (en Inicio) solo mostraba el clima general del día — no había
relación planta↔frecuencia↔última vez que se regó. Se agregó:

- `Plant.wateringFrequencyDays` (`Int`, default `7`) — cada cuántos días
  necesita agua esa especie. Poblado con valores reales para las 18 especies
  sembradas (desde 2 días para `Gunnera tinctoria`/Nalca, que necesita suelo
  pantanoso, hasta 21 días para especies muy tolerantes a la sequía como
  `Puya chilensis` o `Prosopis chilensis`); cualquier especie nueva
  identificada por cámara queda con el default de 7 días hasta que se cure a
  mano en `seed.ts`, mismo criterio que `careInstructions`/`diseases`.
- `CollectionEntry.lastWatered` (`DateTime?`, empieza en `null`) — se fija a
  `new Date()` del **servidor** (nunca una fecha que mande el cliente) vía
  `PATCH /api/album/:id` con `{ regada: true }`.
- `lib/riego.ts` — `diasDesdeUltimoRiego(entrada)` cuenta desde `lastWatered`,
  o desde `identifiedAt` si nunca se regó; `necesitaRiego(entrada)` compara
  ese número contra `plant.wateringFrequencyDays`. Es matemática de fechas
  pura (sin `"use client"`), así que se puede usar tanto en server components
  (`app/page.tsx`) como en client components (`DetalleCliente.tsx`).
- `app/PlantasPorRegar.tsx` en Inicio lista las plantas que necesitan riego
  hoy con un botón rápido "Regué"; `DetalleCliente.tsx` muestra el detalle
  ("Regada hace N días · cada M días") con su propio botón "Regué hoy".

No se integró con `AlertaRiego`/clima — son dos señales separadas a propósito
(una es por especie y fecha, la otra es un tip general del día).

## 🔎 Catálogo de especies

`GET /api/plants` (público, sin auth) y la pantalla `/catalogo` (también
pública) exponen las especies del catálogo con buscador por nombre común o
científico. Existían 18 especies sembradas que nadie podía explorar salvo
identificándolas una por una con la cámara. `CatalogoCliente.tsx` hace
`fetch` una vez al montar y filtra en memoria (18 registros, no vale la pena
pegarle a la API por cada tecleo). Enlazada desde la tarjeta "Flora Chilena"
de Inicio y desde la landing pública.

## 🌍 Exportación ciencia ciudadana (CSV Darwin Core)

Botón "📤 Exportar CSV" en `AlbumCliente.tsx` — `lib/exportarCsv.ts` arma un
CSV con columnas del estándar Darwin Core que usa GBIF (`scientificName`,
`eventDate`, `decimalLatitude`/`decimalLongitude`, `locality`, `recordedBy`,
`associatedMedia`, `establishmentMeans`) y lo descarga con
`Blob` + `URL.createObjectURL` — **sin backend ni librería nueva**, mismo
truco de generación 100% cliente que usa RutinIA con `window.print()`. No es
un Darwin Core Archive completo (eso requeriría un `meta.xml` y empaquetado
zip), es un CSV con esos nombres de columna — suficiente para que un usuario
lo suba a mano a iNaturalist o lo adjunte a un reporte a GBIF, no una
integración automática con ninguna de las dos plataformas.

## 🍂 Desafíos por temporada (hiperlocal, versión acotada)

La idea original "hiperlocal Región del Maule" agrupaba 3 cosas: desafíos por
temporada, rutas de avistamiento curadas en el mapa, y alianza con
CONAF/Jardín Botánico (esto último no es código, es una relación
institucional). Se acotó a **desafíos por temporada** porque reutiliza datos
que ya existen sin tocar el schema — las otras dos ideas quedan sin
implementar.

`lib/desafios.ts` calcula 3 retos según la temporada meteorológica actual
(Verano = dic-ene-feb, Otoño = mar-abr-may, Invierno = jun-jul-ago,
Primavera = sep-oct-nov — `inicioTemporada()` maneja el cruce de año para
Verano: en enero/febrero la temporada empezó en diciembre del año anterior):

1. Identificar 3 plantas esta temporada
2. Encontrar una especie nativa de Chile esta temporada
3. Encontrar una especie poco común/endémica/protegida/casi extinta esta
   temporada

Mismo patrón que `lib/logros.ts` (función pura, se recalcula al vuelo desde
`CollectionEntry[]`, sin tabla ni cache) pero con `progreso`/`meta` en vez de
solo `desbloqueado`, porque acá interesa mostrar avance parcial. Se muestran
en Perfil, en una sección propia con barra de progreso justo antes de Logros.
Como se recalculan siempre desde cero, un desafío completado en una temporada
pasada no queda registrado — si se quiere un historial de desafíos
completados habría que persistirlos, no está hecho.

## 🎓 Posicionamiento "gratis, sin ads" en la landing

`LandingPublica.tsx` tiene 3 badges en el hero ("100% gratis", "Sin ads",
"Sin letra chica ni suscripciones ocultas") — es la queja #1 del mercado
según la investigación de Opus (cobros inesperados post-trial, paywalls
agresivos, dark patterns en cancelación). Solo copy, sin lógica nueva.

## 📅 Historial/timeline por planta

Las hasta 3 fotos de una entrada (`CollectionEntry.photos`) no tenían fecha
individual, solo `identifiedAt` del conjunto entero. Se agregó
`photoDates: DateTime[]` — **array paralelo a `photos`, mismo índice = misma
foto** (no un modelo `Photo` separado, para no tocar todo lo que ya lee
`photos` como `string[]` plano: `AlbumCliente.tsx`, `galeria/page.tsx`,
`VisorFoto.tsx`, etc. siguen exactamente igual).

- Migración `20260919140000_fechas_de_fotos` — la columna nueva y un backfill
  con `array_fill("identifiedAt", ARRAY[array_length("photos", 1)])` para que
  las fotos ya existentes queden con una fecha real (la única que había).
- `POST /api/album` y `POST /api/album/:id/fotos` agregan a **ambos** arrays
  en paralelo (`[...entrada.photos, url]` y `[...entrada.photoDates, new Date()]`).
- `DELETE /api/album/:id/fotos` busca el índice de la URL en `photos`
  (`indexOf`) y filtra **ambos** arrays por ese mismo índice — nunca por
  valor en `photoDates`, porque dos fotos podrían compartir fecha.
- `DetalleCliente.tsx` muestra una sección "📅 Cómo creció" (solo si hay más
  de 1 foto) con cada miniatura + su fecha, reutilizando `VisorFoto` al tocarlas.

**Regla si se toca este código:** cualquier cambio a `photos` (agregar,
eliminar, reordenar) tiene que aplicar el mismo cambio a `photoDates` en la
misma operación — si se desincronizan, el índice deja de significar "misma
foto" y el timeline muestra fechas equivocadas.

## 📴 Modo offline: ver el álbum sin conexión

Identificar una planta requiere conexión sí o sí (llama a PlantNet y a
Cloudinary), así que no es realista un modo offline para identificar sin un
modelo local (fuera de alcance). Lo que sí se implementó: **ver la
colección ya guardada sin señal**, pensado para revisar el álbum en el
campo (una caminata, un parque sin cobertura).

- `public/sw.js` cachea las páginas de navegación (network-first: intenta
  la red, si falla sirve la última copia en cache, y si nunca se cacheó
  muestra la pantalla de "Sin conexión") — antes el service worker nunca
  guardaba las respuestas de navegación exitosas, así que la pantalla de
  "Sin conexión" aparecía casi siempre en vez de la última versión vista.
- Las fotos se cachean igual que el resto de assets estáticos porque
  `next/image` las sirve a través de `/_next/image?url=...` (mismo
  origen), **no** hay que manejar Cloudinary como origen cruzado — el
  optimizador de Next.js ya hace de proxy.
- Al cerrar sesión (`BotonSalir.tsx`), se manda un `postMessage("limpiar-paginas")`
  al service worker para borrar el cache de páginas — evita que en un
  dispositivo compartido el álbum de un usuario quede visible offline
  para el siguiente que inicia sesión.
- Limitación conocida y aceptada: el cache de páginas es por URL, no por
  usuario, así que hasta el próximo logout/página nueva, la copia offline
  siempre es "la última que se vio", puede no reflejar cambios hechos en
  otro dispositivo.

---

## 📋 Reglas Generales

- **TypeScript estricto**, sin `any` implícito
- **async/await**, nunca `.then()` encadenados
- Respuestas consistentes: `{ success: boolean, data?: T, error?: string }`
- **Nunca guardar fotos en el servidor** — van a Cloudinary, solo se guarda la URL
- **Validar con Zod** los inputs de todo route handler que reciba body — `lib/validar.ts` (`parsearBody(req, schema)`) devuelve `{ data }` o `{ error: NextResponse }` listo para retornar; el esquema se define en el mismo archivo del route handler, no en un archivo aparte (mismo patrón que `plantfolio-api` en `middleware/validate.ts`). Los mensajes de error van en español, incluidos los de campo faltante/tipo inválido (`z.string({ error: "..." })`, no solo `.min()`)
- Sin comentarios explicando el qué, solo el porqué cuando no sea obvio
- **No instalar librerías fuera del stack sin confirmar** — el mapa usa Leaflet + OpenStreetMap (sin API key ni costo, a diferencia de Google Maps/Mapbox)

## 📋 Reglas — Prisma / Sesión

- Prisma 7 exige `adapter` en el constructor de `PrismaClient` (`@prisma/adapter-neon`) — nunca usar `url` directo en el schema ni `datasourceUrl` en el cliente, ambos son de versiones viejas de Prisma
- `prisma.config.ts` necesita `datasource: { url: ... }` (no `datasourceUrl`) para que `prisma migrate` funcione
- La sesión vive en la tabla `auth_sessions` + cookie httpOnly (`lib/sesion.ts`) — nunca JWT, nunca el token en `localStorage`
- Correr `npx prisma migrate dev` al modificar el schema; el historial de migraciones ya incluye lo que aplicó `plantfolio-api` contra la misma base de Neon, no borrar esas migraciones viejas
- Un route handler que llama a una API externa lenta (PlantNet, Cloudinary) necesita `export const maxDuration = 60` — el límite por defecto de las funciones serverless de Vercel es más corto que hacer 2+ llamadas externas en secuencia; si son independientes, usar `Promise.all`. **Esto aplica a cada route handler que suba a Cloudinary, no solo a `/api/identify`** — se repitió el mismo bug en `POST /api/album/:id/fotos` (agregar foto extra desde la ficha de detalle) porque se copió el patrón sin copiar el `maxDuration`; con fotos de prueba chicas nunca daba timeout, pero con una foto real de cámara sí podía fallar

## ⚠️ Trampa: `vercel env add` con `echo` agrega un salto de línea

`echo "valor" | vercel env add VAR production` guarda el valor **con un `\n` al
final**, invisible en la mayoría de los usos pero que Cloudinary rechaza con
"Invalid api_key" (401) aunque el mismo key funcione perfecto en local. Usar
`printf '%s' "valor" | vercel env add VAR production` en su lugar. Para
verificar que una env var quedó limpia: `vercel env pull archivo --environment=production --yes && cat -A archivo`
(si aparece `\n` dentro de las comillas, hay que rehacerla).

## ⚠️ Trampa: API Key de Cloudinary nueva sin rol asignado

Una API Key nueva generada desde el dashboard de Cloudinary puede quedar sin
rol asignado — `cloudinary.api.ping()` funciona igual (verifica auth, no
permisos), pero `cloudinary.uploader.upload()` falla con 403 genérico
("Server returned unexpected status code"). Si pasa esto, revisar
**Settings → API Keys → rol de la key** antes de asumir que el código está
mal. `ping()` que funciona + `upload()` que falla con 403 = problema de
permisos de la key, no de credenciales ni de código.

## ⚠️ Trampa: Leaflet necesita `ssr: false`

`leaflet` toca `window` al importarse, así que un componente que lo use no
puede renderizarse en el servidor (`window is not defined`). Patrón usado:
`app/mapa/page.tsx` (server) pasa los datos a `MapaCliente.tsx` ("use client"),
que hace `dynamic(() => import("./MapaLeaflet"), { ssr: false })` — el
`ssr: false` de `next/dynamic` solo se puede usar dentro de un Client
Component, no directo en un Server Component. Los íconos default de Leaflet
también rompen con bundlers si no se referencian explícito — se usan los PNG
de `unpkg.com/leaflet` por URL en vez de pelear con el bundling de assets.

## ⚠️ Trampa: `capture="environment"` bloquea la galería en iOS

`<input type="file" capture="environment">` fuerza la cámara nativa en varios
navegadores móviles (Safari/iOS incluido) y **elimina la opción de elegir una
foto ya tomada desde la galería** — el usuario reportó esto dos veces por
separado: primero en `DetalleCliente.tsx` (agregar foto extra a una entrada
del álbum) y después en `FormularioEscanear.tsx` (pantalla Escanear), porque
al arreglar la primera se asumió sin evidencia que en Escanear sí convenía
forzar cámara. Fix en ambos casos: sacar el atributo `capture` y dejar solo
`accept="image/*"` — el navegador ofrece cámara y galería como opciones. Si
se necesita subir una imagen desde un `<input type="file">` en cualquier
pantalla nueva, no agregar `capture` salvo pedido explícito.

## ⚠️ Trampa: fotos de iPhone (HEIC) rompían la subida silenciosamente

Un archivo HEIC de la librería de fotos de iPhone podía tirar un error de
cliente tipo "The string did not match the expected pattern" en Safari/WebKit
al intentar subir una segunda foto — no reproducible desde curl ni con el SDK
de Cloudinary directo (se descartó como bug de servidor). Fix: `lib/imagenCliente.ts`
(`archivoAJpegBase64`) recodifica cualquier imagen a JPEG vía
`<img>` → `<canvas>` → `toDataURL("image/jpeg", 0.85)` antes de mandarla al
servidor, en vez de perseguir la causa exacta del error nativo. Usado en los
tres lugares donde el cliente sube una imagen: `FormularioEscanear.tsx`,
`DetalleCliente.tsx` (fotos del álbum), `EditarPerfil.tsx` (avatar). Cualquier
input de foto nuevo debe usar esta función, no un `FileReader` a mano.

## ⚠️ Trampa: `findFirst` + `create` condicional sin manejar la colisión

`POST /api/plantas/manual` buscaba con `findFirst` (case-insensitive) y si no
encontraba nada hacía `create` — si dos usuarios identifican manualmente la
misma especie nueva casi al mismo tiempo, ambos pasan el `findFirst` sin
encontrar nada y el segundo `create` choca contra `scientificName @unique`
con un `P2002` sin capturar → 500. Fix: `try/catch` alrededor del `create`,
si el error es `Prisma.PrismaClientKnownRequestError` con `code === "P2002"`
se reusa la fila que ganó la carrera (`findUniqueOrThrow` por
`scientificName`) en vez de tirar el 500. Cuando el registro ya se sabe que
existe de antes (no hay carrera), seguir usando `upsert` como en
`identify/route.ts` — este `try/catch` es específicamente para el caso de
"no existía y dos requests intentaron crearlo al mismo tiempo".

## ⚠️ Trampa: race condition al agregar/eliminar fotos (bloqueo optimista)

`POST`/`DELETE /api/album/:id/fotos` seguían el patrón "leer entidad completa
→ modificar `photos`/`photoDates` en JS → escribir el array completo de
vuelta" sin ninguna protección de concurrencia. Con dos pestañas abiertas (o
un reintento de red tras un timeout), la segunda request leía el estado
*antes* de que la primera escribiera, y su `update` pisaba el cambio de la
primera en silencio — sin error visible, con `photos`/`photoDates`
potencialmente desincronizados.

Fix: `CollectionEntry.version` (`Int @default(0)`, bloqueo optimista). Cada
escritura usa `updateMany({ where: { id, version: entrada.version }, data: {
..., version: { increment: 1 } } })` en vez de `update({ where: { id } })`.
Si `count === 0`, alguien más escribió primero — se devuelve 409 en vez de
sobreescribir con datos viejos. El cliente ya maneja esto sin cambios: el
`catch` genérico de `DetalleCliente.tsx` muestra el `error` del `ApiResponse`
tal cual. **Si se agrega un nuevo endpoint que reconstruye un array a partir
de una lectura previa, hay que aplicar el mismo patrón** (leer `version`,
`updateMany` con ese `version` en el `where`, chequear `count`).

De paso se corrigió que `DELETE` con una URL que ya no está en `photos`
(`indexOf` devuelve `-1`) contestaba `success: true` sin cambiar nada — ahora
devuelve 404 "Esa foto ya no existe".

## ⚠️ Trampa: sin límite de tamaño en las imágenes

Los 3 endpoints que reciben una foto en base64 (`identify`, `album/:id/fotos`,
`perfil/avatar`) validaban el campo `image` solo con `.min(1)`, sin techo.
`lib/validar.ts` exporta `imagenSchema` (con `.max(8_000_000)` caracteres,
~6MB de imagen real) para reusar en los tres en vez de repetir el número.
Cualquier input de foto nuevo debe usar `imagenSchema`, no un `z.string()`
suelto.

## ⚠️ Trampa: cuenta bloqueada para siempre si vence el link de verificación

El link de verificación dura 24h (`lib/cuentas.ts`); si vencía, el texto de
`/verificar` le decía al usuario "registrate de nuevo con el mismo correo",
pero `POST /api/auth/registro` rechaza con 409 si el email ya existe —
**sin importar que nunca se haya verificado**. No había ningún endpoint para
pedir un nuevo enlace, así que el usuario quedaba sin salida.

Fix: `POST /api/auth/reenviar-verificacion` — mensaje genérico (no revela si
el correo existe, salvo que ya esté confirmado), con un throttle simple: si
al usuario le queda más de 23h de vigencia en el token actual (o sea, se lo
mandaron hace menos de 1h), no reenvía. `POST /api/auth/login` ahora incluye
`estado: "sin-verificar"` en el 403 (antes solo mandaba el mensaje en texto);
`FormularioEntrar.tsx` detecta ese campo y muestra un link "¿Venció el
enlace? Reenviar correo de confirmación" que llama al endpoint nuevo con el
email que el usuario ya escribió en el form.

## ⚠️ Trampa: no había forma de recuperar la contraseña

No existía ningún flujo de "olvidé mi contraseña" — cualquier reseteo
dependía de que Iván interviniera a mano en la base. Fix: `User.tokenReset`/
`tokenResetExpira`, **campos separados** de `tokenVerificacion`/`tokenExpira`
(a propósito: si compartieran el mismo campo, pedir un reset invalidaría en
silencio un link de verificación de email pendiente, o viceversa).

- `POST /api/auth/olvide-password` — mensaje genérico (no revela si el
  correo existe), mismo throttle de 1h que `reenviar-verificacion`.
- `POST /api/auth/restablecer` — valida el token con `tokenVigente()` (mismo
  helper que usa la verificación de email), hashea la nueva contraseña, y
  **invalida todas las `AuthSession` del usuario** (`$transaction` con
  `authSession.deleteMany`) — si alguien pidió el reset porque sospecha que
  le robaron la cuenta, esto cierra cualquier sesión activa en otros
  dispositivos.
- Link "¿Olvidaste tu contraseña?" en `FormularioEntrar.tsx` → `/olvide-password`
  → `/restablecer?token=...` (el link que llega por correo).

Verificado con un flujo completo contra producción (token inválido, password
corta, reset válido, reutilizar el mismo token después de usado, chequeo de
que las sesiones viejas quedan invalidadas) antes de darlo por bueno.

## ⚠️ Trampa: el mensaje de throttle filtraba si un correo existía

`reenviar-verificacion` y `olvide-password` devuelven un mensaje genérico a
propósito para no revelar si un correo está registrado. Pero el caso de
throttle ("ya te mandamos un correo hace instantes, esperá 1h") devolvía un
mensaje **distinto** al genérico — así que dos llamadas seguidas al mismo
endpoint con el mismo correo permitían distinguir "existe y no está
verificada/no venció el throttle" de "no existe o ya está verificada",
exactamente lo que el mensaje genérico quería evitar. Encontrado por una
segunda pasada de auditoría (otra sesión de Claude, verificado a mano línea
por línea antes de aplicar el fix — no se asume que un hallazgo externo es
correcto sin comprobarlo contra el código real). Fix: el throttle devuelve
el mismo `MENSAJE_GENERICO` que todos los demás casos, sin excepción.
**Cualquier endpoint nuevo con este patrón (mensaje genérico + un caso
especial de throttle/rate-limit) tiene que devolver el mismo mensaje en
todas las ramas de éxito**, no una variante que delate el estado interno.

## ⚠️ Trampa: subir a Cloudinary antes de validar la escritura deja huérfanos

En `POST /api/album/:id/fotos`, `subirImagen()` corría antes del chequeo de
`version` (bloqueo optimista). Si la escritura perdía la carrera (alguien
más modificó la entrada primero), la imagen ya subida a Cloudinary quedaba
sin referenciar en ningún lado para siempre. Fix: `lib/cloudinary.ts` exporta
`eliminarImagen(url)` (extrae el `public_id` de la URL con una regex sobre
`/upload/.../<public_id>.<ext>` y llama a `cloudinary.uploader.destroy`), que
se invoca cuando `actualizarConBloqueo()` no queda en estado `"ok"`. Cualquier
flujo que suba un archivo a un servicio externo *antes* de confirmar que el
resto de la operación se pudo completar necesita este mismo patrón de
limpieza si la escritura puede fallar después.

De paso se corrigieron dos cosas más en el mismo endpoint: `findUniqueOrThrow`
después de un `updateMany` exitoso podía tirar una excepción sin capturar si
la entrada completa se borraba justo en ese instante (`DELETE
/api/album/:id` concurrente) — se cambió a `findUnique` con manejo explícito
de `null` como 404. Y el bloqueo optimista, que estaba duplicado casi
textual entre `POST` y `DELETE`, se extrajo a `actualizarConBloqueo()` /
`respuestaSegunResultado()` compartidos por ambos handlers.

## ⚠️ API keys nuevas pueden tardar en activarse

PlantNet y Cloudinary respondieron al toque, pero **OpenWeather tarda un par
de horas** en activar una key recién creada (401 hasta entonces, mismo error
que una key inválida). Si un endpoint nuevo con una API key falla justo
después de crearla, probar con `curl` directo a la API externa antes de
asumir que es un bug de código — puede ser solo cuestión de esperar.

## 📋 Reglas — Frontend

- App Router de Next.js, páginas protegidas hacen su propio chequeo:
  `const usuario = await obtenerUsuarioServidor(); if (!usuario) redirect("/entrar")`
- Tailwind con las clases del sistema de diseño ya definido en `tailwind.config.js`, nunca CSS-in-JS ni MUI
- Barra inferior de 5 tabs (`components/BarraInferior.tsx`) es la navegación — no agregar drawer lateral ni bottom sheet
- Cámara/ubicación son APIs web nativas (`<input capture>`, `navigator.geolocation`), no librerías nuevas
- Para ampliar una foto a pantalla completa usar `components/VisorFoto.tsx` (recibe `fotos`, `indice`, `alt`, `onCerrar`) en vez de armar un lightbox nuevo — ya lo usan `DetalleCliente.tsx` y `GaleriaFotos.tsx`

---

## 🚀 Sprints

### ✅ Sprint 1 — Base del proyecto
- [x] Auth completo (registro, login, logout, sesión)
- [x] Migración a PWA (Next.js, manifest, service worker)
- [x] Deploy en Vercel, funcionando sin backend externo

### ✅ Sprint 2 — Identificación IA
- [x] Pantalla Escanear con captura/subida de foto
- [x] `POST /api/identify` con PlantNet + upsert de `Plant` (ver flujo arriba)
- [x] Cloudinary configurado en `plantfolio-web`
- [x] Pantalla de resultado + botón "Agregar al álbum"

### ✅ Sprint 3 — Álbum y Perfil
- [x] Grid de álbum (`AlbumCliente.tsx`), `RarityBadge` (colores ya definidos en Tailwind)
- [x] `GET/POST/DELETE /api/album`
- [x] Estadísticas reales en Perfil (plantas/especies/raras)
- [x] Búsqueda y filtro por rareza en álbum (client-side, sin paginación)
- [x] Detalle por entrada (`/album/:id`, fotos + nota libre)

### ✅ Sprint 4 — Mapa, Gamificación y Riego
- [x] Mapa interactivo con Leaflet + OpenStreetMap, `GET /api/album/mapa`
- [x] Sistema de logros (7 logros, calculados al vuelo desde el álbum — `lib/logros.ts`)
- [x] Alertas de riego con OpenWeather — `GET /api/clima`, componente `AlertaRiego` en Inicio
- [x] Recordatorios de riego reales por especie (`wateringFrequencyDays` + `lastWatered`, `lib/riego.ts`, `PlantasPorRegar.tsx`)
- [x] Seed de flora nativa chilena — 18 especies reales en `prisma/seed.ts`
- [ ] Notificaciones — evaluar Web Push como reemplazo de Expo Notifications (sin arrancar, es la única pieza que queda)

---

## 🧪 Comandos Útiles

```bash
npm run dev                # Next dev en :3001
npm run build               # build + type-check
npx prisma migrate dev      # aplicar cambios de schema
npx prisma studio           # explorar la BD
npx eslint .                # lint
vercel --prod                # deploy a producción
```

---

## ⚠️ Lo que NO hacer

- ❌ No reintroducir un backend separado — todo se resuelve en Next.js con Prisma directo, como RutinIA
- ❌ No guardar el token de sesión en `localStorage` — la cookie httpOnly + `auth_sessions` ya lo resuelven
- ❌ No llamar a PlantNet ni a Cloudinary desde el cliente — siempre desde un route handler
- ❌ No resubir la foto a Cloudinary al agregar al álbum — `/api/identify` ya la subió, reusar ese `photoUrl`
- ❌ No crear un `CollectionEntry` sin garantizar antes que el `Plant` existe (el bug del plan original)
- ❌ No tocar `plantfolio` (Expo) para mantenerlo sincronizado con esta app — son pistas independientes
- ❌ No commitear `.env` (contiene `DATABASE_URL`) — usar `vercel env add` para producción
- ❌ No dejar que `esAdmin` se pueda setear desde la UI o un endpoint — solo a mano en la base
- ❌ No comparar emails sin normalizar — siempre `.trim().toLowerCase()` en registro y login (bug real que hubo: la cuenta admin quedó guardada como `Ivan.solis20.m@gmail.com` con mayúscula)

---

*Plantfolio Web · Iván Solís Manqueo · Talca, Chile · 2026*
