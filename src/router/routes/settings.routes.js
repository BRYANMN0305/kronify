/**
 * settings.routes.js — Rutas del panel de configuración
 * ======================================================
 * /configuracion — Panel de configuración del usuario autenticado.
 * ======================================================
 */

export default [
  {
    path: '/configuracion',
    name: 'Configuracion',
    component: () => import('@/views/settings/SettingsView.vue'),
    meta: { requiresAuth: true },
  },
]
