/**
 * guards.js — Guardias de navegación del router
 * ======================================================
 * authGuard:
 *   - Si la ruta es "guest" y el usuario ya está
 *     autenticado, redirige al Dashboard.
 *   - Si la ruta requiere autenticación y no hay token,
 *     redirige al Login.
 *   - En cualquier otro caso, permite la navegación.
 * ======================================================
 */

/**
 * authGuard — Guardia global de autenticación
 * @param {import('vue-router').RouteLocationNormalized} to — ruta destino
 * @returns {boolean|object} true = permite, { name } = redirige
 */
export function authGuard(to) {
  // Lee el token directamente de localStorage para evitar
  // depender de Pinia antes de que la app esté montada
  const token = localStorage.getItem('token')

  // Si la ruta es para invitados pero ya hay sesión → Dashboard
  if (to.meta?.guest && token) {
    return { name: 'Dashboard' }
  }

  // Si la ruta requiere auth y no hay token → Login
  if (to.meta?.requiresAuth && !token) {
    return { name: 'Login' }
  }

  // Permite la navegación
  return true
}
