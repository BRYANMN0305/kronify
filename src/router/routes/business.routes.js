/** OnboardingNegocio — Ruta de pantalla completa (sin sidebar) */
export const OnboardingBusiness = {
  path: '/onboarding-negocio',
  name: 'OnboardingNegocio',
  component: () => import('@/views/onboarding/OnboardingBusinessView.vue'),
  meta: { requiresAuth: true },
}
