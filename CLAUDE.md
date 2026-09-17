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
| **Estado** | Sprint 1-3 completos y verificados en producción. Sprint 4 pendiente. |
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
├── escanear/            ← identificar + agregar al álbum (FormularioEscanear.tsx cliente)
├── mapa/                ← placeholder, Sprint 4
├── api/auth/            ← route handlers: login, registro, logout, me
├── api/identify/        ← PlantNet + Cloudinary + upsert de Plant
├── api/album/           ← GET/POST + DELETE [id]
├── layout.tsx           ← resuelve sesión server-side, PWA, React Query
├── manifest.ts           ← manifest de PWA
├── registrar-sw.tsx      ← registra el service worker (solo producción)
└── page.tsx              ← Inicio
components/               ← EstadoConexion, BarraInferior (5 tabs), RarityBadge
lib/
├── prisma.ts             ← PrismaClient + adapter de Neon
├── sesion.ts             ← sesión en BD (crearSesion/cerrarSesion/obtenerUsuarioServidor)
├── plantnet.ts           ← identifica especie, mapea confianza→rareza
└── cloudinary.ts         ← sube foto, devuelve solo la URL
store/authStore.ts        ← Zustand, solo el usuario (no el token)
prisma/schema.prisma       ← modelos de datos
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
| **OpenWeather API** | Alertas de riego según clima (Sprint 4) | No implementado en ningún repo |

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
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
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
  photoUrl     String
  notes        String?
  latitude     Float?
  longitude    Float?
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

La tabla `plants` deja de estar vacía a medida que se identifican especies
(`/api/identify` hace `upsert` por `scientificName`), pero el **seed de flora
nativa chilena** completo sigue siendo tarea de Sprint 4 — hoy el catálogo solo
tiene lo que los usuarios fueron identificando.

---

## 🔌 Endpoints (Route Handlers de Next.js)

| Método | Ruta | Descripción | Estado |
|---|---|---|---|
| POST | `/api/auth/registro` | Registro → crea sesión en BD | ✅ |
| POST | `/api/auth/login` | Login → crea sesión en BD | ✅ |
| POST | `/api/auth/logout` | Borra sesión | ✅ |
| GET | `/api/auth/me` | Usuario autenticado actual | ✅ |
| POST | `/api/identify` | Envía foto a PlantNet + Cloudinary + upsert de Plant | ✅ |
| GET/POST | `/api/album` | Álbum del usuario (POST reusa el `photoUrl` que ya subió identify, no resube) | ✅ |
| DELETE | `/api/album/:id` | Eliminar entrada (chequea ownership) | ✅ |
| GET | `/api/plants` | Catálogo (con filtros) | ⏳ Sprint 4 |
| GET | `/api/album/mapa` | Entradas con GPS | ⏳ Sprint 4 |

Todos se implementan como Route Handlers con Prisma directo — **no existe
un backend separado al que llamar.**

---

## 🌿 Flujo de Identificación IA (Sprint 2-3 — implementado)

El plan original (`docs` nunca creados de `plantfolio-api`) tenía un hueco: el
paso de identificar nunca creaba el `Plant` en el catálogo, así que
`POST /api/album` fallaba con "planta no encontrada" porque exigía un
`plantId` que no existía. Flujo tal como quedó implementado:

1. Usuario abre **Escanear**, toma foto con `<input type="file" capture="environment">` o la sube desde galería
2. Foto se convierte a base64 en el cliente (`archivoABase64` en `FormularioEscanear.tsx`)
3. `POST /api/identify` recibe el base64, corre **en paralelo** (`Promise.all`)
   `identificarPlanta()` (PlantNet) y `subirImagen()` (Cloudinary) — importante en
   Vercel, donde el límite de duración por defecto es más corto que hacerlas en
   secuencia (ver `maxDuration = 60` en el route handler)
4. PlantNet responde: nombre científico, nombre común, familia, confianza
5. El handler hace `prisma.plant.upsert({ where: { scientificName }, ... })`
   antes de responder, así siempre hay un `plantId` válido — esto es lo que
   cierra el gap del plan original
6. Se guarda `IdentificationLog` y se devuelve el resultado (con `plantId` y
   `photoUrl` ya resueltos) al cliente
7. Usuario ve el resultado con `RarityBadge`; si confirma "Agregar al álbum",
   `POST /api/album` crea el `CollectionEntry` **reusando el mismo `photoUrl`**
   (no vuelve a subir la foto a Cloudinary) y captura GPS best-effort con
   `navigator.geolocation` (si el usuario niega el permiso, se guarda sin
   coordenadas, no bloquea)

---

## 📋 Reglas Generales

- **TypeScript estricto**, sin `any` implícito
- **async/await**, nunca `.then()` encadenados
- Respuestas consistentes: `{ success: boolean, data?: T, error?: string }`
- **Nunca guardar fotos en el servidor** — van a Cloudinary, solo se guarda la URL
- **Validar con Zod** los inputs de los route handlers antes de tocar Prisma (no está en uso todavía, agregar cuando se construya Sprint 2+; `plantfolio-api` tiene el patrón en `middleware/validate.ts` para copiar la idea)
- Sin comentarios explicando el qué, solo el porqué cuando no sea obvio
- **No instalar librerías fuera del stack sin confirmar** — para Sprint 4 (mapa) hay que decidir la librería web (Leaflet, Mapbox GL, Google Maps JS) antes de agregarla

## 📋 Reglas — Prisma / Sesión

- Prisma 7 exige `adapter` en el constructor de `PrismaClient` (`@prisma/adapter-neon`) — nunca usar `url` directo en el schema ni `datasourceUrl` en el cliente, ambos son de versiones viejas de Prisma
- `prisma.config.ts` necesita `datasource: { url: ... }` (no `datasourceUrl`) para que `prisma migrate` funcione
- La sesión vive en la tabla `auth_sessions` + cookie httpOnly (`lib/sesion.ts`) — nunca JWT, nunca el token en `localStorage`
- Correr `npx prisma migrate dev` al modificar el schema; el historial de migraciones ya incluye lo que aplicó `plantfolio-api` contra la misma base de Neon, no borrar esas migraciones viejas
- Un route handler que llama a una API externa lenta (PlantNet, Cloudinary) necesita `export const maxDuration = 60` — el límite por defecto de las funciones serverless de Vercel es más corto que hacer 2+ llamadas externas en secuencia; si son independientes, usar `Promise.all`

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
- [ ] Detalle por entrada (hoy solo hay grid + eliminar, no una vista de detalle separada)

### ⏳ Sprint 4 — Mapa y Gamificación
- [ ] Mapa interactivo (elegir librería web: Leaflet/Mapbox/Google Maps)
- [ ] `GET /api/album/mapa`
- [ ] Sistema de logros básico (no arrancado)
- [ ] Alertas de riego con OpenWeather (env var existe, sin usar en ningún repo)
- [ ] Seed de flora nativa chilena en la tabla `plants` (hoy vacía)
- [ ] Notificaciones — evaluar Web Push como reemplazo de Expo Notifications

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

---

*Plantfolio Web · Iván Solís Manqueo · Talca, Chile · 2026*
