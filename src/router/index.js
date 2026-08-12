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

/**
 * Layout de rutas autenticadas (sidebar).
 * El path '/app' es solo para que el layout no matchee la raíz '/'
 * (un record sin path la captura e impide el redirect a /iniciar-sesion).
 * Los hijos usan paths absolutos, así que siguen matcheando dentro del layout.
 */
const authLayout = {
  path: '/app',
  component: () => import('@/layouts/AppLayout.vue'),
  children: [
    // Calendario (protegida)
    {
 
  path: '/calendario',
  name: 'Calendario',
  component: () => import('@/views/CalendarRouterView.vue'),
  meta: { requiresAuth: true },

  },
 

    {
      path: '/mis-citas',
      name: 'MisCitas',
      component: () => import('@/views/client/MyAppointmentsView.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/resenas',
      name: 'Resenas',
      component: () => import('@/views/dashboard/ReviewsView.vue'),
      meta: { requiresAuth: true },
    },

    // Servicios
    {
      path: '/servicios',
      name: 'Servicios',
      component: () => import('@/views/services/ServicesView.vue'),
      meta: { requiresAuth: true },
    },

    // Horarios
    {
      path: '/horarios',
      name: 'Horarios',
      component: () => import('@/views/schedules/SchedulesView.vue'),
      meta: { requiresAuth: true },
    },

    // Rutas de configuración: /configuracion
    ...settingsRoutes,
  ],
}

/** Lista completa de rutas */
const routes = [
  // Rutas de autenticación: /iniciar-sesion, /registro
  ...authRoutes,

  // Rutas públicas: /negocio/:slug
  ...publicRoutes,

  // Aceptación de invitación de empleado (accesible con y sin sesión)
  {
    path: '/invitacion/aceptar',
    name: 'AceptarInvitacion',
    component: () => import('@/views/invitation/InvitationAcceptView.vue'),
  },

  // Onboarding (pantalla completa, sin sidebar)
  OnboardingBusiness,

  // Rutas autenticadas con AppLayout
  authLayout,

  // Redirección raíz → iniciar sesión
  {
    path: '/',
    redirect: '/iniciar-sesion',
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
