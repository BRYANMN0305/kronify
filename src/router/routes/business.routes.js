export default [
  {
    path: '/onboarding-negocio',
    name: 'OnboardingBusiness',
    component: () => import('@/views/onboarding/OnboardingBusinessView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/servicios',
    name: 'Services',
    component: () => import('@/views/services/ServicesView.vue'),
    meta: { requiresAuth: true },
  },
]
