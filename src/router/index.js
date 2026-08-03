/**
 * index.js — Configuración del router
 * ======================================================
 * Crea el router con createWebHistory (modo history),
 * registra las rutas de autenticación y el guardia global.
 * ======================================================
 */

import { createRouter, createWebHistory } from 'vue-router'
import authRoutes from './routes/auth.routes'
import businessRoutes from './routes/business.routes'
import settingsRoutes from './routes/settings.routes'
import { authGuard } from './guards'
import publicRoutes from './routes/public.routes'

/** Lista completa de rutas */
const routes = [
  // Rutas de autenticación: /login, /register
  ...authRoutes,

  // Rutas de negocio: /onboarding-negocio
  ...businessRoutes,

  // Rutas públicas: /negocio/:slug
  ...publicRoutes,

  // Rutas de configuración: /settings
  ...settingsRoutes,

  // Redirección raíz → login
  {
    path: '/',
    redirect: '/login',
  },

  // Dashboard (protegida)
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
]

/** Instancia del router con modo history */
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guardia global de autenticación
router.beforeEach(authGuard)

export default router