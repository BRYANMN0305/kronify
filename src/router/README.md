# router/ — Enrutamiento SPA

Configuracion de Vue Router 5 con modo history.

## Archivos

| Archivo                | Descripcion                                              |
|------------------------|----------------------------------------------------------|
| `index.js`             | Instancia del router, registro de rutas y guardia global |
| `guards.js`            | Guardia de navegacion basada en token JWT (localStorage) |
| `routes/auth.routes.js`| Rutas `/login` y `/register` (ambas usan AuthView)       |

## Rutas

| Ruta         | Nombre     | Componente      | Meta              |
|--------------|------------|-----------------|-------------------|
| `/`          | —          | redirect → `/login` | —             |
| `/login`     | `Login`    | `AuthView.vue`  | `{ guest: true }` |
| `/register`  | `Register` | `AuthView.vue`  | `{ guest: true }` |
| `/dashboard` | `Dashboard`| `DashboardView` | `{ requiresAuth: true }` |

## Guardia de navegacion (`guards.js`)

```
Ruta guest + token existe   → redirige a Dashboard
Ruta requiresAuth + sin token → redirige a Login
Cualquier otro caso           → permite navegacion
```

El guard lee `localStorage` directamente (no usa Pinia) para evitar problemas durante la inicializacion de la app.

## Nota sobre Vue Router 5

- `/login` y `/register` usan la **misma referencia** de componente (`AuthView`) para que Vue Router reutilice la instancia y la animacion slide funcione sin recargar.
