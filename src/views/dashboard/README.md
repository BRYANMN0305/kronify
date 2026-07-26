# dashboard/ — Panel de control

Vista protegida que solo se muestra con sesion activa.

## Archivos

| Archivo            | Descripcion                                      |
|--------------------|--------------------------------------------------|
| `DashboardView.vue`| Panel de control con informacion del usuario     |

## DashboardView.vue

Vista placeholder del dashboard. Muestra:

- Nombre del usuario autenticado
- Boton de cerrar sesion

## Proteccion

La ruta `/dashboard` tiene `meta: { requiresAuth: true }`. El guardia global redirige a `/login` si no hay token en localStorage.
