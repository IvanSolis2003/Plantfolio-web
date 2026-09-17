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
├── LandingPublica.tsx    ← lo que ve un visitante sin sesión en / (hero + preview de galería)
├── AlertaRiego.tsx       ← cliente, pide geolocalización best-effort, se muestra en Inicio
├── layout.tsx           ← resuelve sesión server-side, PWA, React Query
├── manifest.ts           ← manifest de PWA
├── registrar-sw.tsx      ← registra el service worker (solo producción)
└── page.tsx              ← Inicio
components/               ← EstadoConexion, BarraInferior (5 tabs), RarityBadge, HeaderPublico
lib/
├── prisma.ts             ← PrismaClient + adapter de Neon
├── sesion.ts             ← sesión en BD (crearSesion/cerrarSesion/obtenerUsuarioServidor/obtenerUsuarioId)
├── cuentas.ts            ← estadoDe/nuevoToken/vencimiento/tokenVigente (igual que RutinIA)
├── correo.ts             ← Resend + plantillas de verificación/aprobación
├── plantnet.ts           ← identifica especie, mapea confianza→rareza
├── cloudinary.ts         ← sube foto, devuelve solo la URL
├── clima.ts              ← alerta de riego según humedad/temperatura
├── geocoding.ts          ← reverse geocoding con Nominatim, coordenadas redondeadas
└── logros.ts             ← calcula logros al vuelo desde el álbum (sin tabla nueva)
store/authStore.ts        ← Zustand, solo el usuario (no el token)
prisma/
├── schema.prisma          ← modelos de datos
└── seed.ts                ← 18 especies reales de flora nativa chilena
public/sw.js               ← service worker (cache-first assets, offline fallback)
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
  entries          CollectionEntry[]
}

model CollectionEntry {
  id           String   @id @default(cuid())
  userId       String
  plantId      String
  photos       String[]
  notes        String?
  latitude     Float?
  longitude    Float?
  ubicacionAprox String?
  privado      Boolean  @default(false)
  identifiedAt DateTime @default(now())
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
| GET | `/api/auth/me` | Usuario autenticado actual | ✅ |
| POST | `/api/identify` | Envía foto a PlantNet + Cloudinary + upsert de Plant | ✅ |
| GET/POST | `/api/album` | Álbum del usuario (POST reusa la foto que ya subió identify, no resube) | ✅ |
| DELETE | `/api/album/:id` | Eliminar entrada (chequea ownership) | ✅ |
| PATCH | `/api/album/:id` | `{ privado?, notes? }` — actualiza lo que venga (chequea ownership) | ✅ |
| POST | `/api/album/:id/fotos` | Agrega una foto (máx 3, sube a Cloudinary) | ✅ |
| DELETE | `/api/album/:id/fotos` | Saca una foto por URL (mín 1) | ✅ |
| GET | `/api/album/mapa` | Entradas con GPS, para el mapa Leaflet | ✅ |
| GET | `/api/clima` | Alerta de riego (requiere `?lat=&lon=`) | ✅ |
| POST | `/api/admin/aprobar` | Habilita una cuenta (solo `esAdmin`) | ✅ |
| POST | `/api/perfil/privacidad` | Toggle de `coleccionPrivada` | ✅ |
| PATCH | `/api/perfil` | `{ bio?, ubicacionTexto?, compartirPerfil? }` | ✅ |
| POST | `/api/perfil/avatar` | Sube avatar a Cloudinary | ✅ |
| GET | `/api/plants` | Catálogo completo con filtros (no hay pantalla que lo use todavía) | ⏳ |

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

---

## 📋 Reglas Generales

- **TypeScript estricto**, sin `any` implícito
- **async/await**, nunca `.then()` encadenados
- Respuestas consistentes: `{ success: boolean, data?: T, error?: string }`
- **Nunca guardar fotos en el servidor** — van a Cloudinary, solo se guarda la URL
- **Validar con Zod** los inputs de los route handlers antes de tocar Prisma (no está en uso todavía, agregar cuando se construya Sprint 2+; `plantfolio-api` tiene el patrón en `middleware/validate.ts` para copiar la idea)
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
