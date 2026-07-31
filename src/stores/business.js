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

  const fetchStatus = async () => {
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

  return {
    business, employees, pendingInvitations, fetched, loading,
    hasBusiness, hasEmployee, hasPendingInvitation, needsOnboarding,
    fetchStatus, createBusiness,
  }
})
