/**
 * employee.js — Servicio de llamadas HTTP de empleados, horarios y servicios
 * ===========================================================================
 * Usa fetch nativo (request de ./http) con token JWT.
 * Endpoints base: /business/employees/
 * ===========================================================================
 */

import { request } from './http'

/** employeeService — Métodos de empleados, horarios y vinculación de servicios */
export const employeeService = {
  /** getEmployees — Lista los empleados activos del negocio (solo dueño) */
  getEmployees() {
    return request('/business/employees/', { method: 'GET' })
  },

  /** getMyEmployee — Devuelve el registro de empleado del usuario autenticado (self-service) */
  getMyEmployee() {
    return request('/business/employees/me', { method: 'GET' })
  },

  /** updateSchedulePermission — Cambia si el empleado puede gestionar su propio horario */
  updateSchedulePermission(employeeId, selfManagedSchedule) {
    return request(`/business/employees/${employeeId}/schedule-permission`, {
      method: 'PATCH',
      body: JSON.stringify({ selfManagedSchedule }),
    })
  },

  /** listWeeklySchedules — Horarios semanales de un empleado */
  listWeeklySchedules(employeeId) {
    return request(`/business/employees/${employeeId}/weekly-schedules`, { method: 'GET' })
  },

  /** upsertWeeklySchedule — Crea o actualiza el horario de un día (dayOfWeek 1-7) */
  upsertWeeklySchedule(employeeId, payload) {
    return request(`/business/employees/${employeeId}/weekly-schedules`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /** deleteWeeklySchedule — Elimina el horario semanal de un día */
  deleteWeeklySchedule(employeeId, weeklyScheduleId) {
    return request(`/business/employees/${employeeId}/weekly-schedules/${weeklyScheduleId}`, {
      method: 'DELETE',
    })
  },

  /** listScheduleBlocks — Bloqueos de agenda de un empleado */
  listScheduleBlocks(employeeId) {
    return request(`/business/employees/${employeeId}/schedule-blocks`, { method: 'GET' })
  },

  /** createScheduleBlock — Crea un bloqueo (startAt,endAt,reason) */
  createScheduleBlock(employeeId, payload) {
    return request(`/business/employees/${employeeId}/schedule-blocks`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /** deleteScheduleBlock — Elimina un bloqueo de agenda */
  deleteScheduleBlock(employeeId, scheduleBlockId) {
    return request(`/business/employees/${employeeId}/schedule-blocks/${scheduleBlockId}`, {
      method: 'DELETE',
    })
  },

  /** listEmployeeServices — Servicios vinculados al empleado */
  listEmployeeServices(employeeId) {
    return request(`/business/employees/${employeeId}/services`, { method: 'GET' })
  },

  /** addEmployeeServices — Vincula servicios al empleado (solo agrega) */
  addEmployeeServices(employeeId, serviceIds) {
    return request(`/business/employees/${employeeId}/services`, {
      method: 'PATCH',
      body: JSON.stringify({ serviceIds }),
    })
  },

  /** removeEmployeeService — Desvincula un servicio del empleado */
  removeEmployeeService(employeeId, serviceId) {
    return request(`/business/employees/${employeeId}/services/${serviceId}`, {
      method: 'DELETE',
    })
  },
}