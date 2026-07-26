# views/ — Vistas/paginas

Cada subdirectorio representa un modulo funcional de la aplicacion.

## Subdirectorios

| Directorio   | Descripcion                                     |
|--------------|-------------------------------------------------|
| `auth/`      | Modulo de autenticacion (login, register, OAuth) |
| `dashboard/` | Panel de control (protegido, requiere sesion)    |
| `public/`    | Paginas publicas (landing, about, etc.)          |

## Convenciones

- Cada vista principal usa su propio layout via `<AuthLayout>`, `<DashboardLayout>`, etc.
- Las vistas se cargan con lazy-loading en el router (`() => import(...)`)
- Las vistas de auth comparten `AuthView.vue` para la animacion slide
