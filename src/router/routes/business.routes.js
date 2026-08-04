/** OnboardingBusiness — Ruta de pantalla completa (sin sidebar) */
export const OnboardingBusiness = {
  path: '/onboarding-negocio',
  name: 'OnboardingBusiness',
  component: () => import('@/views/onboarding/OnboardingBusinessView.vue'),
  meta: { requiresAuth: true },
}
