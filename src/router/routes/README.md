# routes/ — Definicion de rutas

Archivos que exportan arrays de rutas para Vue Router.

## Archivos

| Archivo          | Descripcion                                      |
|------------------|--------------------------------------------------|
| `auth.routes.js` | Rutas de autenticacion: `/login` y `/register`  |

## Convenciones

- Cada archivo exporta un array de objetos de ruta
- Las rutas se combinan en `router/index.js`
- Las rutas lazy-loaded usan `() => import(...)` para code-splitting
- Las rutas con `meta.guest` bloquean el acceso si ya hay sesion activa
