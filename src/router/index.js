/**
 * index.js — Configuración del router
 * ======================================================
 * Crea el router con createWebHistory (modo history),
 * registra las rutas de autenticación y el guardia global.
 * ======================================================
 */

import { createRouter, createWebHistory } from 'vue-router'
import authRoutes from './routes/auth.routes'
import { OnboardingBusiness } from './routes/business.routes'
import settingsRoutes from './routes/settings.routes'
import { authGuard } from './guards'
import publicRoutes from './routes/public.routes'

/** Rutas autenticadas envueltas en el AppLayout (sidebar) */
const authLayout = {
  component: () => import('@/layouts/AppLayout.vue'),
  children: [
    // Dashboard (protegida)
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/DashboardView.vue'),
      meta: { requiresAuth: true },
    },

    // Servicios
    {
      path: '/servicios',
      name: 'Services',
      component: () => import('@/views/services/ServicesView.vue'),
      meta: { requiresAuth: true },
    },

    // Horarios
    {
      path: '/horarios',
      name: 'Schedules',
      component: () => import('@/views/schedules/SchedulesView.vue'),
      meta: { requiresAuth: true },
    },

    // Rutas de configuración: /settings
    ...settingsRoutes,
  ],
}

/** Lista completa de rutas */
const routes = [
  // Rutas de autenticación: /login, /register
  ...authRoutes,

  // Rutas públicas: /negocio/:slug
  ...publicRoutes,

  // Aceptación de invitación de empleado (accesible con y sin sesión)
  {
    path: '/invitacion/aceptar',
    name: 'InvitationAccept',
    component: () => import('@/views/invitation/InvitationAcceptView.vue'),
  },

  // Onboarding (pantalla completa, sin sidebar)
  OnboardingBusiness,

  // Rutas autenticadas con AppLayout
  authLayout,

  // Redirección raíz → login
  {
    path: '/',
    redirect: '/login',
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