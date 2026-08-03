export default [
  {
    path: '/negocio/:slug',
    name: 'PublicBusiness',
    component: () => import('@/views/public/PublicBusinessView.vue'),
    // sin meta.requiresAuth: es pública
  },
]