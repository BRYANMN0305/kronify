<template>
  <div class="onboarding-page d-flex flex-column min-vh-100" style="background: var(--color-bg); overflow-x: hidden;">
    <div class="p-3 p-md-4">
      <button class="btn btn-sm rounded-2 px-3 btn-back" @click="handleBack">
        ← Volver
      </button>
    </div>

    <div class="flex-grow-1 d-flex align-items-center justify-content-center p-4">
      <div class="w-100" style="max-width: 560px;">
        <OnboardingBusinessForm />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import OnboardingBusinessForm from '@/components/onboarding/OnboardingBusinessForm.vue'

const router = useRouter()
const authStore = useAuthStore()

function handleBack() {
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.onboarding-page {
  min-height: 100vh;
  min-height: 100dvh;
}

.btn-back {
  --bs-btn-color: var(--color-text-muted);
  --bs-btn-border-color: var(--color-border);
  --bs-btn-hover-color: var(--color-text);
  --bs-btn-hover-border-color: var(--color-border-hover);
  --bs-btn-bg: transparent;
  --bs-btn-hover-bg: transparent;
}
</style>
