import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { businessService } from '@/api/business'

export const useBusinessStore = defineStore('business', () => {
  const business = ref(null)
  const employees = ref([])
  const pendingInvitations = ref([])
  const fetched = ref(false)
  const loading = ref(false)

  const hasBusiness = computed(() => !!business.value)
  const hasEmployee = computed(() => employees.value.length > 0)
  const hasPendingInvitation = computed(() => pendingInvitations.value.length > 0)
  const needsOnboarding = computed(() => {
    if (!fetched.value) return false
    return !hasBusiness.value && !hasEmployee.value && !hasPendingInvitation.value
  })

  let lastToken = null
  const fetchStatus = async () => {
    // Si cambió la sesión (otra cuenta, otra pestaña, etc.), descarta el estado anterior
    const currentToken = localStorage.getItem('token')
    if (currentToken !== lastToken) {
      reset()
      lastToken = currentToken
    }

    loading.value = true
    try {
      business.value = await businessService.getMe()
      fetched.value = true
    } finally {
      loading.value = false
    }
  }

  const createBusiness = async (payload) => {
    business.value = await businessService.create(payload)
    fetched.value = true
  }

  /** reset — Limpia el estado al cambiar de sesión (evita datos de la cuenta anterior) */
  const reset = () => {
    business.value = null
    employees.value = []
    pendingInvitations.value = []
    fetched.value = false
    loading.value = false
  }

  return {
    business, employees, pendingInvitations, fetched, loading,
    hasBusiness, hasEmployee, hasPendingInvitation, needsOnboarding,
    fetchStatus, createBusiness, reset,
  }
})
