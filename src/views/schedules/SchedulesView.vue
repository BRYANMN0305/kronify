<!-- ============================================================
     SchedulesView.vue — Gestión de horarios de empleados
     ============================================================
     /horarios (requiere auth, aparece en el sidebar).
     Master-detail con conciencia de rol:
       - Dueño: lista de empleados con toggle de autogestión,
         y edita horario semanal, bloqueos y servicios de cada uno.
       - Empleado autogestionado: solo su tarjeta (sin selector)
         y edita su propio horario y bloqueos (no servicios).
     ============================================================ -->

<template>
  <div class="schedules-page">
    <header class="schedules-header">
      <div>
        <h1 class="schedules-title">Horarios</h1>
        <p class="schedules-subtitle">Configura la disponibilidad y los servicios de tu equipo</p>
      </div>
      <button type="button" class="btn-back" @click="router.push('/dashboard')">
        <span class="btn-back-icon" v-html="chevronLeftIcon"></span>
        Volver
      </button>
    </header>

    <div v-if="initError" class="schedules-error-block">
      <div class="settings-alert settings-alert-error">
        <span v-html="alertIcon"></span>
        <span>{{ initError }}</span>
      </div>
    </div>

    <div v-else-if="!mode" class="settings-loading">
      <span class="spinner-border spinner-border-sm" role="status"></span>
      Cargando horarios...
    </div>

    <div v-else>
      <div v-if="isOwnerMode" class="schedules-mode-switch" role="tablist" aria-label="Secciones de horarios">
        <button
          type="button"
          class="schedules-mode-btn"
          :class="{ 'is-active': ownerSection === 'business' }"
          @click="switchOwnerSection('business')"
        >
          Horario del negocio
        </button>
        <button
          type="button"
          class="schedules-mode-btn"
          :class="{ 'is-active': ownerSection === 'employees' }"
          @click="switchOwnerSection('employees')"
        >
          Empleados
        </button>
      </div>

      <div v-if="isOwnerMode && ownerSection === 'business'" class="schedules-layout schedules-layout--single">
        <main class="schedules-detail">
          <div v-if="error" class="settings-alert settings-alert-error">
            <span v-html="alertIcon"></span>
            <span>{{ error }}</span>
          </div>

          <section class="settings-section">
            <h3 class="settings-section-title">Horario de atención</h3>
            <p class="settings-section-subtitle">
              Horario fijo en que tu negocio está abierto. La agenda de cada empleado (incluso si la autogestiona)
              no puede salir de este rango.
            </p>

            <div v-if="loadingBusiness" class="settings-loading">
              <span class="spinner-border spinner-border-sm" role="status"></span>
              Cargando horario del negocio...
            </div>

            <div v-else class="schedules-table">
              <div class="schedules-week-row schedules-week-head">
                <span>Día</span>
                <span>Inicio</span>
                <span>Fin</span>
                <span></span>
              </div>

              <div v-for="row in businessRows" :key="row.dayOfWeek" class="schedules-week-row">
                <span class="schedules-week-day">{{ WEEK_LABELS[row.dayOfWeek - 1] }}</span>
                <input v-model="row.start" type="time" class="form-control" :id="'bstart-' + row.dayOfWeek" />
                <input v-model="row.end" type="time" class="form-control" :id="'bend-' + row.dayOfWeek" />
                <span class="schedules-week-actions">
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    :disabled="savingBusinessDay === row.dayOfWeek"
                    @click="saveBusinessDay(row)"
                  >
                    <span v-if="savingBusinessDay === row.dayOfWeek" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    Guardar
                  </button>
                  <button
                    v-if="row.businessOpeningHourId"
                    type="button"
                    class="btn-action btn-action-danger"
                    :disabled="savingBusinessDay === row.dayOfWeek"
                    @click="deleteBusinessDay(row)"
                  >
                    Eliminar
                  </button>
                </span>
              </div>
            </div>
          </section>
        </main>
      </div>

      <div v-else class="schedules-layout">
      <aside class="schedules-panel">
        <div class="schedules-panel-title">Empleados</div>
        <div v-if="employees.length === 0" class="schedules-empty-panel">
          Aún no hay empleados en tu equipo.
        </div>

        <div
          v-for="emp in employees"
          :key="emp.employeeId"
          class="schedules-employee"
          :class="{ 'is-selected': emp.employeeId === selectedId }"
          tabindex="0"
          role="button"
          @click="selectEmployee(emp)"
        >
          <span class="settings-avatar">{{ initials(emp) }}</span>
          <span class="schedules-emp-info">
            <span class="schedules-emp-name">
              {{ emp.name }} {{ emp.lastName }}
              <span v-if="emp.owner" class="schedules-owner-badge">Dueño</span>
            </span>
            <span class="schedules-emp-email">{{ emp.email }}</span>
          </span>

          <span v-if="isOwnerMode" class="schedules-toggle-wrap" @click.stop>
            <span v-if="emp.owner" class="schedules-implicit">Autogestión</span>
            <label v-else class="switch" :title="'Puede gestionar su propio horario'">
              <input
                type="checkbox"
                :checked="emp.selfManagedSchedule"
                :disabled="busyPermId === emp.employeeId"
                @change="togglePermission(emp)"
              />
              <span class="switch-slider"></span>
            </label>
          </span>
        </div>
      </aside>

      <main class="schedules-detail">
        <div
          v-if="isSelfMode && myEmployee && !myEmployee.selfManagedSchedule"
          class="settings-alert settings-alert-error"
        >
          <span v-html="alertIcon"></span>
          <span>El dueño aún no ha habilitado la autogestión de tu horario.</span>
        </div>

        <template v-else-if="selectedId">
          <nav class="schedules-tabs" aria-label="Secciones del horario">
            <button
              type="button"
              class="schedules-tab-btn"
              :class="{ 'is-active': activeTab === 'weekly' }"
              @click="activeTab = 'weekly'"
            >
              Horario semanal
            </button>
            <button
              type="button"
              class="schedules-tab-btn"
              :class="{ 'is-active': activeTab === 'blocks' }"
              @click="activeTab = 'blocks'"
            >
              Bloqueos
            </button>
            <button
              v-if="isOwnerMode"
              type="button"
              class="schedules-tab-btn"
              :class="{ 'is-active': activeTab === 'services' }"
              @click="activeTab = 'services'"
            >
              Servicios
            </button>
          </nav>

          <div v-if="loadingDetail" class="settings-loading">
            <span class="spinner-border spinner-border-sm" role="status"></span>
            Cargando horario...
          </div>

          <template v-else>
            <div v-if="error" class="settings-alert settings-alert-error">
              <span v-html="alertIcon"></span>
              <span>{{ error }}</span>
            </div>

            <!-- Sub-tab: Horario semanal -->
            <section v-if="activeTab === 'weekly'" class="settings-section">
              <h3 class="settings-section-title">Horario semanal</h3>
              <p class="settings-section-subtitle">Define el horario recurrente para cada día de la semana.</p>

              <div class="schedules-table">
                <div class="schedules-week-row schedules-week-head">
                  <span>Día</span>
                  <span>Inicio</span>
                  <span>Fin</span>
                  <span></span>
                </div>

                <div v-for="row in weekRows" :key="row.dayOfWeek" class="schedules-week-row">
                  <span class="schedules-week-day">{{ WEEK_LABELS[row.dayOfWeek - 1] }}</span>
                  <input v-model="row.start" type="time" class="form-control" :id="'wstart-' + row.dayOfWeek" />
                  <input v-model="row.end" type="time" class="form-control" :id="'wend-' + row.dayOfWeek" />
                  <span class="schedules-week-actions">
                    <button
                      type="button"
                      class="btn btn-primary btn-sm"
                      :disabled="savingDay === row.dayOfWeek"
                      @click="saveDay(row)"
                    >
                      <span v-if="savingDay === row.dayOfWeek" class="spinner-border spinner-border-sm me-1" role="status"></span>
                      Guardar
                    </button>
                    <button
                      v-if="row.weeklyScheduleId"
                      type="button"
                      class="btn-action btn-action-danger"
                      :disabled="savingDay === row.dayOfWeek"
                      @click="deleteDay(row)"
                    >
                      Eliminar
                    </button>
                  </span>
                </div>
              </div>
            </section>

            <!-- Sub-tab: Bloqueos -->
            <section v-else-if="activeTab === 'blocks'" class="settings-section">
              <h3 class="settings-section-title">Bloqueos</h3>
              <p class="settings-section-subtitle">Marca días u horas donde este empleado no estará disponible.</p>

              <div v-if="blocks.length === 0" class="settings-empty">No hay bloqueos para este empleado.</div>

              <div v-else class="schedules-table">
                <div class="schedules-blocks-row schedules-blocks-head">
                  <span>Inicio</span>
                  <span>Fin</span>
                  <span>Motivo</span>
                  <span></span>
                </div>
                <div v-for="b in blocks" :key="b.scheduleBlockId" class="schedules-blocks-row">
                  <span>{{ fmtDateTime(b.startAt) }}</span>
                  <span>{{ fmtDateTime(b.endAt) }}</span>
                  <span>{{ b.reason || '—' }}</span>
                  <span class="schedules-block-actions">
                    <button
                      type="button"
                      class="btn-action btn-action-danger"
                      :disabled="busyBlockId === b.scheduleBlockId"
                      @click="removeBlock(b)"
                    >
                      Eliminar
                    </button>
                  </span>
                </div>
              </div>

              <form class="schedules-block-form" novalidate @submit.prevent="addBlock">
                <div class="d-flex gap-2 flex-wrap align-items-end">
                  <div>
                    <label class="form-label" for="block-start">Inicio</label>
                    <input id="block-start" v-model="blockStart" type="datetime-local" class="form-control" />
                  </div>
                  <div>
                    <label class="form-label" for="block-end">Fin</label>
                    <input id="block-end" v-model="blockEnd" type="datetime-local" class="form-control" />
                  </div>
                  <div class="flex-grow-1" style="min-width: 150px">
                    <label class="form-label" for="block-reason">Motivo (opcional)</label>
                    <input
                      id="block-reason"
                      v-model="blockReason"
                      type="text"
                      class="form-control"
                      placeholder="Vacaciones, capacitación…"
                    />
                  </div>
                  <button type="submit" class="btn btn-primary btn-sm" :disabled="creatingBlock">
                    <span v-if="creatingBlock" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    Agregar bloqueo
                  </button>
                </div>
              </form>
            </section>

            <!-- Sub-tab: Servicios (solo dueño) -->
            <section v-else class="settings-section">
              <h3 class="settings-section-title">Servicios</h3>
              <p class="settings-section-subtitle">Selecciona los servicios que este empleado puede realizar.</p>

              <div v-if="allServices.length === 0" class="schedules-empty-note">
                Aún no hay servicios creados. Créalos desde la sección <strong>Servicios</strong> para poder vincularlos.
              </div>

              <template v-else>
                <div v-if="loadingLinked" class="settings-loading" style="padding: 1.25rem 0">
                  <span class="spinner-border spinner-border-sm" role="status"></span>
                </div>

                <div v-else class="schedules-service-list">
                  <div v-for="s in allServices" :key="s.id" class="schedules-service-item">
                    <input type="checkbox" :id="'svc-' + s.id" :value="s.id" v-model="selectedIds" />
                    <label :for="'svc-' + s.id" class="schedules-service-label">
                      <span>{{ s.name }}</span>
                      <span class="schedules-service-meta">{{ s.durationMinutes }} min · {{ formatPrice(s.price) }}</span>
                    </label>
                  </div>
                </div>

                <div class="schedules-save-bar">
                  <button type="button" class="btn btn-primary" :disabled="savingServices || loadingLinked" @click="saveServices">
                    <span v-if="savingServices" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardar cambios
                  </button>
                </div>
              </template>
            </section>
          </template>
        </template>

        <div v-else class="settings-section">
          <h3 class="settings-section-title">Selecciona un empleado</h3>
          <p class="settings-section-subtitle">Elige a un miembro del equipo para configurar su horario, bloqueos y servicios.</p>
        </div>
      </main>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * SchedulesView.vue
 * Detección de rol: primero intenta listar empleados (dueño); si el backend
 * responde 403 (no es dueño), cae en /employees/me (self-service).
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { businessService } from '@/api/business'
import { employeeService } from '@/api/employee'
import { useServicesStore } from '@/stores/services'

import chevronLeftIcon from '@/assets/images/icons/chevron-left.svg?raw'
import alertIcon from '@/assets/images/icons/alert-circle.svg?raw'

const router = useRouter()
const servicesStore = useServicesStore()

const WEEK_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

/** Conversión de tiempos del backend (LocalTime "HH:mm:ss" / ISO "yyyy-MM-ddTHH:mm:ss") */
const toInput = (t) => (t ? String(t).slice(0, 5) : '')
const toBackend = (t) => (t ? `${t}:00` : null)
const fmtDateTime = (d) => (d ? dayjs(d).format('DD MMM YYYY · HH:mm') : '—')
const formatPrice = (price) => {
  if (price == null) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)
}
const initials = (emp) => (((emp?.name || ' ').trim()[0] || '') + ((emp?.lastName || ' ').trim()[0] || '')).toUpperCase()

/** Estado global de la vista */
const mode = ref(null) // 'owner' | 'self'
const initError = ref('')
const employees = ref([])
const selectedId = ref(null)
const myEmployee = ref(null)
const loadingDetail = ref(false)
const activeTab = ref('weekly')
const error = ref('')

/** Sección del dueño: horario fijo del negocio vs empleados */
const ownerSection = ref('employees') // 'business' | 'employees'
const businessRows = reactive([1, 2, 3, 4, 5, 6, 7].map((d) => ({ dayOfWeek: d, businessOpeningHourId: null, start: '', end: '' })))
const loadingBusiness = ref(false)
const savingBusinessDay = ref(null)

/** Toggle autogestión (dueño) */
const busyPermId = ref(null)

/** Navegación a servicios */
const linkedIds = ref([])
const selectedIds = ref([])
const loadingLinked = ref(false)
const savingServices = ref(false)

const isOwnerMode = computed(() => mode.value === 'owner')
const isSelfMode = computed(() => mode.value === 'self')

const allServices = computed(() => (servicesStore.services || []).filter((s) => s.active))

/** Horario semanal */
const blankRow = (d) => ({ dayOfWeek: d, weeklyScheduleId: null, start: '', end: '' })
const weekRows = reactive([1, 2, 3, 4, 5, 6, 7].map(blankRow))
const savingDay = ref(null)

/** Bloqueos */
const blocks = ref([])
const busyBlockId = ref(null)
const creatingBlock = ref(false)
const blockStart = ref('')
const blockEnd = ref('')
const blockReason = ref('')

const buildWeekRows = (list = []) => {
  const rows = [1, 2, 3, 4, 5, 6, 7].map(blankRow)
  for (const s of list) {
    const r = rows[s.dayOfWeek - 1]
    if (r) Object.assign(r, { weeklyScheduleId: s.weeklyScheduleId, start: toInput(s.startTime), end: toInput(s.endTime) })
  }
  return rows
}

const selectEmployee = (emp) => {
  if (!emp || emp.employeeId === selectedId.value) return
  selectedId.value = emp.employeeId
  activeTab.value = 'weekly'
  loadDetail(emp.employeeId)
}

const loadDetail = async (empId) => {
  if (!empId) return
  loadingDetail.value = true
  error.value = ''
  try {
    const [w, b] = await Promise.all([
      employeeService.listWeeklySchedules(empId),
      employeeService.listScheduleBlocks(empId),
    ])
    weekRows.forEach((r, i) => Object.assign(r, blankRow(r.dayOfWeek)))
    const rows = buildWeekRows(w)
    rows.forEach((r, i) => Object.assign(weekRows[i], r))
    blocks.value = Array.isArray(b) ? b : []
    if (isOwnerMode.value) await loadLinked()
  } catch (e) {
    error.value = e.message || 'Error al cargar el horario'
  } finally {
    loadingDetail.value = false
  }
}

const saveDay = async (row) => {
  if (!selectedId.value) return
  if (!row.start || !row.end) {
    error.value = 'Debes indicar la hora de inicio y de fin'
    return
  }
  if (row.start >= row.end) {
    error.value = 'La hora de inicio debe ser menor que la de fin'
    return
  }
  savingDay.value = row.dayOfWeek
  error.value = ''
  try {
    const saved = await employeeService.upsertWeeklySchedule(selectedId.value, {
      dayOfWeek: row.dayOfWeek,
      startTime: toBackend(row.start),
      endTime: toBackend(row.end),
    })
    row.weeklyScheduleId = saved.weeklyScheduleId
    row.start = toInput(saved.startTime)
    row.end = toInput(saved.endTime)
  } catch (e) {
    error.value = e.message || 'Error al guardar el horario'
  } finally {
    savingDay.value = null
  }
}

const deleteDay = async (row) => {
  if (!selectedId.value || !row.weeklyScheduleId) return
  savingDay.value = row.dayOfWeek
  error.value = ''
  try {
    await employeeService.deleteWeeklySchedule(selectedId.value, row.weeklyScheduleId)
    Object.assign(row, blankRow(row.dayOfWeek))
  } catch (e) {
    error.value = e.message || 'Error al eliminar el horario'
  } finally {
    savingDay.value = null
  }
}

const togglePermission = async (emp) => {
  busyPermId.value = emp.employeeId
  error.value = ''
  try {
    const updated = await employeeService.updateSchedulePermission(emp.employeeId, !emp.selfManagedSchedule)
    emp.selfManagedSchedule = updated.selfManagedSchedule
  } catch (e) {
    error.value = e.message || 'Error al actualizar el permiso'
  } finally {
    busyPermId.value = null
  }
}

const loadBlocks = async () => {
  if (!selectedId.value) return
  try {
    blocks.value = await employeeService.listScheduleBlocks(selectedId.value)
  } catch (e) {
    error.value = e.message || 'Error al cargar los bloqueos'
  }
}

const addBlock = async () => {
  if (!selectedId.value) return
  if (!blockStart.value || !blockEnd.value) {
    error.value = 'Debes indicar el inicio y el fin del bloqueo'
    return
  }
  if (blockStart.value >= blockEnd.value) {
    error.value = 'La fecha de inicio debe ser menor que la de fin'
    return
  }
  creatingBlock.value = true
  error.value = ''
  try {
    await employeeService.createScheduleBlock(selectedId.value, {
      startAt: `${blockStart.value}:00`,
      endAt: `${blockEnd.value}:00`,
      reason: blockReason.value.trim() || null,
    })
    blockStart.value = ''
    blockEnd.value = ''
    blockReason.value = ''
    await loadBlocks()
  } catch (e) {
    error.value = e.message || 'Error al crear el bloqueo'
  } finally {
    creatingBlock.value = false
  }
}

const removeBlock = async (b) => {
  if (!selectedId.value) return
  busyBlockId.value = b.scheduleBlockId
  error.value = ''
  try {
    await employeeService.deleteScheduleBlock(selectedId.value, b.scheduleBlockId)
    await loadBlocks()
  } catch (e) {
    error.value = e.message || 'Error al eliminar el bloqueo'
  } finally {
    busyBlockId.value = null
  }
}

const loadLinked = async () => {
  if (!selectedId.value) return
  loadingLinked.value = true
  try {
    const list = await employeeService.listEmployeeServices(selectedId.value)
    linkedIds.value = (list || []).map((s) => s.id)
    selectedIds.value = [...linkedIds.value]
  } catch (e) {
    error.value = e.message || 'Error al cargar los servicios del empleado'
  } finally {
    loadingLinked.value = false
  }
}

const saveServices = async () => {
  if (!selectedId.value) return
  const wanted = [...selectedIds.value]
  const current = [...linkedIds.value]
  const adds = wanted.filter((id) => !current.includes(id))
  const removes = current.filter((id) => !wanted.includes(id))
  if (adds.length === 0 && removes.length === 0) {
    return
  }
  savingServices.value = true
  error.value = ''
  try {
    if (adds.length > 0) await employeeService.addEmployeeServices(selectedId.value, adds)
    for (const sid of removes) await employeeService.removeEmployeeService(selectedId.value, sid)
    await loadLinked()
  } catch (e) {
    error.value = e.message || 'Error al actualizar los servicios'
  } finally {
    savingServices.value = false
  }
}

const switchOwnerSection = async (section) => {
  ownerSection.value = section
  error.value = ''
  if (section === 'business' && !loadingBusiness.value) {
    await loadBusinessRows()
  }
}

const applyBusinessRows = (list = []) => {
  businessRows.forEach((r) => Object.assign(r, { businessOpeningHourId: null, start: '', end: '' }))
  for (const item of list) {
    const row = businessRows[item.dayOfWeek - 1]
    if (row) Object.assign(row, { businessOpeningHourId: item.businessOpeningHourId, start: toInput(item.startTime), end: toInput(item.endTime) })
  }
}

const loadBusinessRows = async () => {
  loadingBusiness.value = true
  error.value = ''
  try {
    const list = await businessService.getOpeningHours()
    applyBusinessRows(list || [])
  } catch (e) {
    error.value = e.message || 'Error al cargar el horario del negocio'
  } finally {
    loadingBusiness.value = false
  }
}

const buildBusinessPayload = () =>
  businessRows
    .filter((row) => row.start && row.end)
    .map((row) => ({ dayOfWeek: row.dayOfWeek, startTime: toBackend(row.start), endTime: toBackend(row.end) }))

const refreshBusinessRows = (list) => {
  applyBusinessRows(Array.isArray(list) ? list : [])
}

const saveBusinessDay = async (row) => {
  if (!row.start || !row.end) {
    error.value = 'Debes indicar la hora de inicio y de fin'
    return
  }
  if (row.start >= row.end) {
    error.value = 'La hora de inicio debe ser menor que la de fin'
    return
  }
  savingBusinessDay.value = row.dayOfWeek
  error.value = ''
  try {
    const saved = await businessService.updateOpeningHours(buildBusinessPayload())
    refreshBusinessRows(saved)
  } catch (e) {
    error.value = e.message || 'Error al guardar el horario del negocio'
  } finally {
    savingBusinessDay.value = null
  }
}

const deleteBusinessDay = async (row) => {
  savingBusinessDay.value = row.dayOfWeek
  error.value = ''
  try {
    const saved = await businessService.updateOpeningHours(
      buildBusinessPayload().filter((item) => item.dayOfWeek !== row.dayOfWeek)
    )
    refreshBusinessRows(saved)
  } catch (e) {
    error.value = e.message || 'Error al eliminar el horario del negocio'
  } finally {
    savingBusinessDay.value = null
  }
}

onMounted(async () => {
  try {
    const list = await employeeService.getEmployees()
    employees.value = list || []
    mode.value = 'owner'
    servicesStore.fetchAll().catch(() => {})
    if (employees.value.length) selectEmployee(employees.value[0])
  } catch (e1) {
    try {
      const me = await employeeService.getMyEmployee()
      myEmployee.value = me
      employees.value = [me]
      mode.value = 'self'
      selectedId.value = me.employeeId
      if (me.selfManagedSchedule) {
        activeTab.value = 'weekly'
        loadDetail(me.employeeId)
      }
    } catch (e2) {
      initError.value = e2.message || e1.message || 'No puedes acceder a esta sección'
    }
  }
})
</script>