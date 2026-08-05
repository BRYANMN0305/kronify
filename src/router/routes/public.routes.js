export default [
  {
    path: '/negocio/:slug',
    name: 'NegocioPublico',
    component: () => import('@/views/public/PublicBusinessView.vue'),
    // sin meta.requiresAuth: es pública
  },
]
