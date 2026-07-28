export default [
  {
    path: '/onboarding-negocio',
    name: 'OnboardingBusiness',
    component: () => import('@/views/onboarding/OnboardingBusinessView.vue'),
    meta: { requiresAuth: true },
  },
]
