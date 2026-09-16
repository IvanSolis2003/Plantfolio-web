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
| **Estado** | Sprint 1 completo y migrado a PWA. Sprint 2-4 pendientes. |
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
├── perfil/              ← perfil + logout (BotonSalir.tsx cliente)
├── album/               ← placeholder, Sprint 3
├── escanear/            ← placeholder, Sprint 2
├── mapa/                ← placeholder, Sprint 4
├── api/auth/            ← route handlers: login, registro, logout, me
├── layout.tsx           ← resuelve sesión server-side, PWA, React Query
├── manifest.ts           ← manifest de PWA
├── registrar-sw.tsx      ← registra el service worker (solo producción)
└── page.tsx              ← Inicio
components/               ← EstadoConexion, BarraInferior (5 tabs)
lib/
├── prisma.ts             ← PrismaClient + adapter de Neon
└── sesion.ts             ← sesión en BD (crearSesion/cerrarSesion/obtenerUsuarioServidor)
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

### Servicios externos (para Sprint 2-4, todavía no configurados en este repo)
| Servicio | Uso | Estado |
|---|---|---|
| **Plant.id API** | Identificación de plantas por foto | Pendiente — key no está en `.env` de plantfolio-web |
| **Cloudinary** | Storage de imágenes (solo guardar la URL) | Pendiente |
| **Neon.tech** | PostgreSQL — ya en uso | ✅ Configurado |
| **OpenWeather API** | Alertas de riego según clima (Sprint 4) | No implementado en ningún repo |

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

⚠️ **La tabla `plants` está vacía.** El seed de flora nativa chilena es tarea de
Sprint 4 en el plan original — no es un bug que esté vacía ahora.

---

## 🔌 Endpoints (Route Handlers de Next.js)

| Método | Ruta | Descripción | Estado |
|---|---|---|---|
| POST | `/api/auth/registro` | Registro → crea sesión en BD | ✅ |
| POST | `/api/auth/login` | Login → crea sesión en BD | ✅ |
| POST | `/api/auth/logout` | Borra sesión | ✅ |
| GET | `/api/auth/me` | Usuario autenticado actual | ✅ |
| GET | `/api/plants` | Catálogo (con filtros) | ⏳ Sprint 3/4 |
| POST | `/api/identify` | Envía foto a Plant.id | ⏳ Sprint 2 |
| GET/POST | `/api/album` | Álbum del usuario | ⏳ Sprint 3 |
| DELETE | `/api/album/:id` | Eliminar entrada | ⏳ Sprint 3 |
| GET | `/api/album/mapa` | Entradas con GPS | ⏳ Sprint 4 |

Todos se implementan como Route Handlers con Prisma directo — **no existe
un backend separado al que llamar.**

---

## 🌿 Flujo de Identificación IA (Sprint 2 — corregido)

El plan original (`docs` nunca creados de `plantfolio-api`) tenía un hueco: el
paso de identificar nunca creaba el `Plant` en el catálogo, así que
`POST /api/album` fallaba con "planta no encontrada" porque exigía un
`plantId` que no existía. Flujo corregido:

1. Usuario abre **Escanear**, toma foto con `<input type="file" capture="environment">` o la sube desde galería
2. Foto se convierte a base64 en el cliente
3. `POST /api/identify` (route handler) recibe el base64
4. El handler llama a **Plant.id API** (la key nunca se expone al cliente)
5. Plant.id responde: nombre científico, común, confianza %, cuidados, enfermedades
6. **Paso que faltaba en el plan original:** el handler hace
   `prisma.plant.upsert({ where: { scientificName }, ... })` — busca o crea la
   planta en el catálogo antes de devolver la respuesta, para que ya exista un
   `plantId` válido
7. Se guarda `IdentificationLog` y se devuelve el resultado (incluyendo el
   `plantId` recién resuelto) al cliente
8. Cliente muestra el resultado; si el usuario confirma, `POST /api/album` sube
   la foto a Cloudinary y crea el `CollectionEntry` con el `plantId` ya
   garantizado

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

### ⏳ Sprint 2 — Identificación IA
- [ ] Pantalla Escanear con captura/subida de foto
- [ ] `POST /api/identify` con Plant.id + upsert de `Plant` (ver flujo corregido arriba)
- [ ] Cloudinary configurado en `plantfolio-web`
- [ ] Pantalla de resultado + botón "Agregar al álbum"

### ⏳ Sprint 3 — Álbum y Perfil
- [ ] `AlbumGrid`, detalle por entrada, `RarityBadge` (colores ya definidos en Tailwind)
- [ ] `GET/POST/DELETE /api/album`
- [ ] Estadísticas reales en Perfil (hoy son placeholder en `0`)
- [ ] Búsqueda y filtros en álbum

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
- ❌ No llamar a Plant.id ni a Cloudinary desde el cliente — siempre desde un route handler
- ❌ No crear un `CollectionEntry` sin garantizar antes que el `Plant` existe (el bug del plan original)
- ❌ No tocar `plantfolio` (Expo) para mantenerlo sincronizado con esta app — son pistas independientes
- ❌ No commitear `.env` (contiene `DATABASE_URL`) — usar `vercel env add` para producción

---

*Plantfolio Web · Iván Solís Manqueo · Talca, Chile · 2026*
