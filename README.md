# Plantfolio Web

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript) ![Tailwind](https://img.shields.io/badge/CSS-Tailwind%20v3-38B2AC?logo=tailwindcss) ![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8)

Progressive Web App para identificar y coleccionar flora chilena con la cámara del celular. Es la versión web (instalable, mobile-first) del cliente original de Plantfolio, hecho en Expo/React Native.

## Qué resuelve

Plantfolio ya existía como app Expo, pero eso obliga a instalar desde una tienda y limita el alcance. Esta versión reconstruye la misma experiencia como PWA: se instala con un toque desde el navegador, funciona con conexión intermitente y llega a cualquier dispositivo sin pasar por App Store/Play Store.

## Features

- **Identificar planta** — captura o sube una foto y la app la identifica.
- **Álbum** — colección personal de plantas identificadas (pantalla placeholder, migración de plataforma en curso).
- **Mapa** — ubicación de los hallazgos (pantalla placeholder).
- **Perfil** y sesión — entrar / registrarse, cerrar sesión.
- **PWA real**: manifest instalable, ícono y splash propios, service worker con banner de "sin conexión".
- **Sesión seleccion JWT en cookie httpOnly** — el token nunca queda expuesto al cliente ni en `localStorage`.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v3 (barra de navegación inferior estilo app, no se usó MUI)
- Zustand + TanStack React Query
- Backend: consume [`plantfolio-api`](https://github.com/IvanSolis2003) (Express + Prisma + JWT + Cloudinary) — no incluido en este repo

## Arquitectura

Este repo es **solo el frontend/PWA**. La lógica de negocio (usuarios, plantas, identificación, álbum) vive en `plantfolio-api`, un backend Express separado. Plantfolio Web nunca llama a `plantfolio-api` directamente desde el cliente: cada acción pasa por un **route handler proxy** de Next.js que:

1. Lee el JWT de la cookie httpOnly de sesión (nunca accesible desde JS del navegador).
2. Reenvía la petición a `plantfolio-api` con el header `Authorization: Bearer <token>`.
3. Devuelve la respuesta al cliente.

```
app/
├── entrar/, registro/        # Auth
├── album/, escanear/, mapa/, perfil/   # Pantallas de la app (protegidas)
├── api/auth/*                # Route handlers: login/registro guardan el JWT en cookie httpOnly
├── api/plants/*, api/identify, api/album/*   # Proxies hacia plantfolio-api
├── manifest.ts                # Manifest de instalación PWA
└── registrar-sw.tsx           # Registro del service worker
lib/
├── sesion.ts        # obtenerUsuarioServidor(), lectura de la cookie de sesión
├── proxyApi.ts       # helper que arma el proxy autenticado hacia plantfolio-api
└── plantsService.ts
public/sw.js          # Service worker (cache-first / network-first + banner offline)
```

Cada pantalla protegida hace su propio chequeo de sesión server-side (`obtenerUsuarioServidor()`) y redirige a `/entrar` si no hay usuario — no hay un middleware centralizado.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local
npm run dev
```

Requiere `plantfolio-api` corriendo (local o remoto) para que login/registro y las pantallas funcionen contra datos reales.

## Variables de entorno

```env
PLANTFOLIO_API_URL=http://localhost:3000   # URL del backend plantfolio-api
```

## Estado del proyecto

Migración de plataforma (Expo → Next.js PWA) recién completada:

- ✅ Infraestructura PWA (manifest, service worker, banner offline), sesión JWT en cookie httpOnly, pantallas de auth, inicio y perfil con datos reales.
- ⏳ Álbum, Escanear y Mapa siguen siendo pantallas placeholder — la migración fue solo de plataforma, sin features nuevas todavía.
- ⏳ Falta probar el flujo real de login/registro contra una base de datos y recorrer la app en un navegador con `plantfolio-api` desplegado.
- ⏳ Falta decidir el hosting de producción y apuntar `PLANTFOLIO_API_URL` al backend real.

## Autor

**Iván Solís Manqueo** — Full Stack Developer, Talca, Chile
[iasmtech.com](https://iasmtech.com) · [ivan.solis20.m@gmail.com](mailto:ivan.solis20.m@gmail.com)
