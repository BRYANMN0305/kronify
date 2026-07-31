/**
 * settings.js — Estado global del panel de configuración
 * ======================================================
 * Centraliza los datos del usuario, del negocio (solo dueño),
 * invitaciones, plan y estado del dueño como empleado.
 *
 * Caché por sección: la primera carga usa spinner; las
 * siguientes son instantáneas (datos en memoria) y se
 * revalidan en silencio en background.
 * ======================================================
 */

import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { userService } from '@/api/user'
import { businessService } from '@/api/business'
import { invitationService } from '@/api/invitation'
import { planService } from '@/api/plan'

export const useSettingsStore = defineStore('settings', () => {
  const profile = ref(null)
  const authMethods = ref([])
  const businessData = ref(null)
  const invitations = ref([])
  const plan = ref(null)
  const planHistory = ref([])
  const availablePlans = ref([])
  const ownerAsEmployee = ref(false)
  const loading = ref(false)
  const error = ref('')

  /** loaded — Marca qué secciones ya fueron cargadas al menos una vez */
  const loaded = reactive({
    profile: false,
    business: false,
    invitations: false,
    plan: false,
    planHistory: false,
    availablePlans: false,
    ownerAsEmployee: false,
  })

  /** fetchProfile — Carga el perfil y los métodos de autenticación */
  const fetchProfile = async () => {
    const [p, m] = await Promise.all([
      userService.getProfile(),
      userService.getAuthMethods().catch(() => []),
    ])
    profile.value = p
    authMethods.value = m || []
    loaded.profile = true
  }

  /** fetchBusiness — Carga el negocio del dueño */
  const fetchBusiness = async () => {
    businessData.value = await businessService.getMe()
    loaded.business = true
  }

  /** fetchInvitations — Carga las invitaciones del negocio */
  const fetchInvitations = async () => {
    const data = await invitationService.getAll()
    invitations.value = Array.isArray(data) ? data : data?.invitations || []
    loaded.invitations = true
  }

  /** fetchPlan — Carga el plan actual del negocio */
  const fetchPlan = async () => {
    plan.value = await planService.getCurrent()
    loaded.plan = true
  }

  /** fetchPlanHistory — Carga el historial de planes del negocio */
  const fetchPlanHistory = async () => {
    const data = await planService.getHistory()
    planHistory.value = Array.isArray(data) ? data : data?.history || []
    loaded.planHistory = true
  }

  /** fetchAvailablePlans — Carga el catálogo de planes disponibles */
  const fetchAvailablePlans = async () => {
    const data = await planService.getAvailable()
    availablePlans.value = Array.isArray(data) ? data : data?.plans || []
    loaded.availablePlans = true
  }

  /** fetchOwnerAsEmployee — Lee si el dueño tiene registro de empleado activo */
  const fetchOwnerAsEmployee = async () => {
    try {
      const records = await businessService.getEmployees()
      ownerAsEmployee.value = Array.isArray(records) && records.some((r) => r.owner === true)
    } catch {
      ownerAsEmployee.value = false
    }
    loaded.ownerAsEmployee = true
  }

  /** toggleOwnerAsEmployee — POST del toggle + refresco reactivo de plan y empleados */
  const toggleOwnerAsEmployee = async (enabled) => {
    await businessService.toggleOwnerAsEmployee(enabled)
    ownerAsEmployee.value = enabled
    fetchPlan().catch(() => {})
    fetchOwnerAsEmployee().catch(() => {})
  }

  /** changePlan — Cambia el plan del negocio y refresca plan + historial */
  const changePlan = async (planId, activationCode) => {
    await planService.change(planId, activationCode)
    await Promise.all([fetchPlan(), fetchPlanHistory()])
  }

  /** reset — Limpia todo el estado al cambiar de sesión (evita datos de la cuenta anterior) */
  const reset = () => {
    profile.value = null
    authMethods.value = []
    businessData.value = null
    invitations.value = []
    plan.value = null
    planHistory.value = []
    availablePlans.value = []
    ownerAsEmployee.value = false
    loading.value = false
    error.value = ''
    Object.keys(loaded).forEach((key) => {
      loaded[key] = false
    })
  }

  /**
   * fetchAll — Carga todos los datos del panel según el rol.
   * Primera vez: todas las peticiones en paralelo con spinner.
   * Visitas siguientes: usa la caché y revalida en silencio.
   */
  let lastToken = null
  const fetchAll = async (isOwner, { silent } = {}) => {
    // Si cambió la sesión (otra cuenta, otra pestaña, etc.), descarta la caché anterior
    const currentToken = localStorage.getItem('token')
    if (currentToken !== lastToken) {
      reset()
      lastToken = currentToken
    }

    const hasData = loaded.profile
    const silentMode = silent ?? hasData
    if (!silentMode) loading.value = true
    error.value = ''

    try {
      const tasks = [fetchProfile()]
      if (isOwner) {
        tasks.push(
          fetchBusiness(),
          fetchInvitations(),
          fetchPlan(),
          fetchPlanHistory(),
          fetchAvailablePlans(),
          fetchOwnerAsEmployee()
        )
      }
      await Promise.all(tasks)
    } catch (e) {
      if (!silentMode) error.value = e.message || 'Error al cargar la configuración'
    } finally {
      loading.value = false
    }
  }

  return {
    profile, authMethods, businessData, invitations, plan, planHistory, availablePlans,
    ownerAsEmployee, loading, error, loaded,
    fetchProfile, fetchBusiness, fetchInvitations, fetchPlan, fetchPlanHistory,
    fetchAvailablePlans, fetchOwnerAsEmployee, toggleOwnerAsEmployee, changePlan, fetchAll,
    reset,
  }
})
