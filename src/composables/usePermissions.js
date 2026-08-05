/**
 * usePermissions.js — Composable de permisos de navegación
 * ======================================================
 * Centraliza qué secciones puede ver cada rol:
 *   - Dueño:   calendario, servicios, horarios, configuración
 *   - Empleado: calendario, horarios (self-service), configuración
 *   - Cliente:  calendario, configuración
 * ======================================================
 */

import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useBusinessStore } from '@/stores/business'

export const usePermissions = () => {
  const authStore = useAuthStore()
  const businessStore = useBusinessStore()

  /** isOwner — Dueño del negocio (BUSINESS con negocio creado) */
  const isOwner = computed(() => authStore.isBusiness && businessStore.hasBusiness)

  /** isEmployee — Empleado activo de un negocio (BUSINESS sin negocio propio) */
  const isEmployee = computed(() => authStore.isBusiness && !businessStore.hasBusiness && businessStore.hasEmployee)

  /** canManageServices — CRUD de servicios: solo el dueño */
  const canManageServices = computed(() => authStore.isBusiness && businessStore.hasBusiness)

  /** canManageSchedules — Horarios: dueño y empleados (autogestión) */
  const canManageSchedules = computed(() => authStore.isBusiness)

  return { isOwner, isEmployee, canManageServices, canManageSchedules }
}
