import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { businessService } from '@/api/business'
import { employeeService } from '@/api/employee'
import { invitationService } from '@/api/invitation'

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

  async function fetchStatus() {
    loading.value = true
    try {
      const [b, e, i] = await Promise.allSettled([
        businessService.getMe().catch(() => null),
        employeeService.getMine().catch(() => []),
        invitationService.getPending().catch(() => []),
      ])
      business.value = b.status === 'fulfilled' ? b.value : null
      employees.value = e.status === 'fulfilled' ? e.value : []
      pendingInvitations.value = i.status === 'fulfilled' ? i.value : []
      fetched.value = true
    } finally {
      loading.value = false
    }
  }

  async function createBusiness(payload) {
    business.value = await businessService.create(payload)
    fetched.value = true
  }

  return {
    business, employees, pendingInvitations, fetched, loading,
    hasBusiness, hasEmployee, hasPendingInvitation, needsOnboarding,
    fetchStatus, createBusiness,
  }
})
