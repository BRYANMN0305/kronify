/**
 * settings.routes.js — Rutas del panel de configuración
 * ======================================================
 * /settings — Panel de configuración del usuario autenticado.
 * ======================================================
 */

export default [
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/SettingsView.vue'),
    meta: { requiresAuth: true },
  },
]
