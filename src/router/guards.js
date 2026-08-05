/**
 * guards.js — Guardias de navegación del router
 * ======================================================
 * authGuard:
 *   - Si la ruta es "guest" y el usuario ya está
 *     autenticado, redirige al Calendario.
 *   - Si la ruta requiere autenticación y no hay token,
 *     redirige a /iniciar-sesion.
 *   - Para usuarios BUSINESS sin negocio/employee/invitación,
 *     redirige a /onboarding-negocio.
 * ======================================================
 */

import { useBusinessStore } from '@/stores/business'

/**
 * authGuard — Guardia global de autenticación
 * @param {import('vue-router').RouteLocationNormalized} to — ruta destino
 * @returns {boolean|object} true = permite, { name } = redirige
 */
export const authGuard = async (to) => {
  const token = localStorage.getItem('token')

  // Si la ruta es para invitados pero ya hay sesión → Calendario
  if (to.meta?.guest && token) {
    return { name: 'Calendario' }
  }

  // Si la ruta requiere auth y no hay token → Iniciar sesión
  if (to.meta?.requiresAuth && !token) {
    return { name: 'IniciarSesion' }
  }

  // --- Onboarding check para BUSINESS users ---
  if (token && to.meta?.requiresAuth) {
    const user = JSON.parse(localStorage.getItem('user') || 'null')

    if (user?.profileType === 'BUSINESS') {
      const businessStore = useBusinessStore()

      if (!businessStore.fetched) {
        try {
          await businessStore.fetchStatus()
        } catch {
          return true
        }
      }

      if (businessStore.needsOnboarding && to.name !== 'OnboardingNegocio') {
        return { name: 'OnboardingNegocio' }
      }

      if (to.name === 'OnboardingNegocio' && !businessStore.needsOnboarding) {
        return { name: 'Calendario' }
      }
    }
  }

  return true
}
