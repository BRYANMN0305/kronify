# api/ — Cliente HTTP

Modulo de comunicacion con el backend REST.

## Archivos

- `auth.js` — Funciones `login()`, `register()` y `loginWithOAuth()`. Usa `fetch` con token Bearer desde localStorage.

## Convenciones

- La URL base se lee de `VITE_API_URL` (`.env`)
- Los errores se propagan como objetos `{ message, status }`
- Todas las peticiones incluyen `Content-Type: application/json`
- El token JWT se agrega automaticamente en el header `Authorization`
