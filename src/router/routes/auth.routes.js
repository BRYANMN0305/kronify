/**
 * auth.routes.js — Rutas de autenticación
 * ======================================================
 * - /login    → AuthView con LoginForm
 * - /register → AuthView con RegisterForm
 * ======================================================
 *
 * Ambas rutas comparten la MISMA referencia de componente
 * para que vue-router reutilice la instancia de AuthView
 * y la animación slide funcione sin recargar.
 */

// Misma referencia para ambas rutas → vue-router reutiliza el componente
const AuthView = () => import('@/views/auth/AuthView.vue')

export default [
  {
    path: '/login',
    name: 'Login',
    component: AuthView,
    meta: { layout: 'auth', guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: AuthView,
    meta: { layout: 'auth', guest: true },
  },
]
