<template>
  <div class="work-page">
    <div class="work-inner">
      <header class="work-header">
        <div class="work-header-text">
          <span class="eyebrow">Tu actividad</span>
          <h1>Mis citas</h1>
        </div>
        <span class="header-chip">Cliente</span>
      </header>

      <div v-if="!loading && !error && appointments.length" class="stats-row">
        <div class="stat-card">
          <span class="stat-value">{{ appointments.length }}</span>
          <span class="stat-label">Citas</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ countStatus('PENDING') }}</span>
          <span class="stat-label">Pendientes</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ countStatus('CONFIRMED') }}</span>
          <span class="stat-label">Confirmadas</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ countStatus('COMPLETED') }}</span>
          <span class="stat-label">Completadas</span>
        </div>
      </div>

      <section v-if="isClient" class="panel-section">
        <div class="section-head">
          <div>
            <span class="section-kicker">Agenda rapida</span>
            <h2>Negocios recientes</h2>
          </div>
          <span v-if="recentBusinesses.length" class="recent-count">{{ recentBusinesses.length }}</span>
        </div>

        <div v-if="loadingRecent" class="state state--compact">Cargando negocios recientes...</div>
        <div v-else-if="recentBusinesses.length" class="recent-scroll">
          <RecentBusinessCard
            v-for="business in recentBusinesses"
            :key="business.businessId"
            :business="business"
            @select="openBusiness"
          />
        </div>
        <p v-else class="recent-empty">
          Aun no tienes negocios recientes. Cuando reserves una cita, aparecera aqui para que vuelvas a agendar facilmente.
        </p>
      </section>

      <section class="panel-section">
        <div class="section-head">
          <div>
            <span class="section-kicker">Historial</span>
            <h2>Mis citas</h2>
          </div>
        </div>

        <div v-if="loading" class="state">Cargando tus citas...</div>
        <div v-else-if="error" class="state state-error">{{ error }}</div>
        <div v-else-if="appointments.length === 0" class="state">Aun no tienes citas registradas.</div>

        <div v-else class="stack">
          <AppointmentListItem
            v-for="appointment in appointments"
            :key="appointment.appointmentId"
            :appointment="appointment"
            :busy="busyId === appointment.appointmentId"
            @cancel="cancelAppointment"
            @reviewed="load"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { appointmentService } from '@/api/appointment'
import { useAuthStore } from '@/stores/auth'
import AppointmentListItem from '@/components/client/AppointmentListItem.vue'
import RecentBusinessCard from '@/components/client/RecentBusinessCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const appointments = ref([])
const loading = ref(false)
const error = ref('')
const busyId = ref(null)

const recentBusinesses = ref([])
const loadingRecent = ref(false)
const recentError = ref('')

const isClient = computed(() => authStore.profileType === 'CLIENT')

const countStatus = (status) => appointments.value.filter((ap) => ap.status === status).length

async function load() {
  loading.value = true
  error.value = ''
  try {
    const page = await appointmentService.getHistory({ size: 50 })
    appointments.value = page?.content || []
  } catch (err) {
    error.value = err.message || 'No se pudo cargar el historial'
  } finally {
    loading.value = false
  }
}

async function loadRecentBusinesses() {
  if (!isClient.value) return
  loadingRecent.value = true
  recentError.value = ''
  try {
    recentBusinesses.value = (await appointmentService.getRecentBusinesses()) || []
  } catch (err) {
    console.warn('No se pudieron cargar los negocios recientes:', err?.message)
    recentBusinesses.value = []
  } finally {
    loadingRecent.value = false
  }
}

function openBusiness(business) {
  router.push({ name: 'NegocioPublico', params: { slug: business.slug } })
}

async function cancelAppointment(appointment) {
  busyId.value = appointment.appointmentId
  error.value = ''
  try {
    const updated = await appointmentService.cancel(appointment.appointmentId)
    appointments.value = appointments.value.map((item) =>
      item.appointmentId === updated.appointmentId ? updated : item
    )
  } catch (err) {
    error.value = err.message || 'No se pudo cancelar la cita'
  } finally {
    busyId.value = null
  }
}

onMounted(() => {
  load()
  loadRecentBusinesses()
})
</script>

<style scoped>
.work-page {
  background: radial-gradient(circle at top left, rgba(63, 225, 255, 0.05), transparent 34%), var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
  padding: 28px 32px;
}
.work-inner { margin: 0 auto; max-width: 1080px; }

/* ---- Header ---- */
.work-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
.eyebrow {
  color: var(--neon);
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.work-header h1 { font-size: 1.6rem; line-height: 1.1; margin: 4px 0 0; }
.header-chip {
  background: rgba(63, 225, 255, 0.1);
  border: 1px solid rgba(63, 225, 255, 0.22);
  border-radius: 999px;
  color: rgba(213, 240, 247, 0.8);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.35rem 0.8rem;
}

/* ---- Stats ---- */
.stats-row {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: 26px;
}
.stat-card {
  background: linear-gradient(180deg, rgba(16, 37, 44, 0.92), rgba(10, 24, 30, 0.92));
  border: 1px solid rgba(63, 106, 120, 0.45);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-value { color: var(--neon); font-size: 1.5rem; font-weight: 900; line-height: 1; }
.stat-label { color: rgba(213, 240, 247, 0.6); font-size: 0.76rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }

/* ---- Paneles de sección ---- */
.panel-section {
  background: rgba(6, 13, 16, 0.55);
  border: 1px solid rgba(63, 106, 120, 0.35);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 26px;
}
.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-kicker { color: var(--neon); display: block; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; }
.section-head h2 { color: var(--color-text); font-size: 1.15rem; font-weight: 900; margin: 3px 0 0; }
.recent-count {
  background: rgba(63, 225, 255, 0.12);
  border: 1px solid rgba(63, 225, 255, 0.2);
  border-radius: 999px;
  color: rgba(213, 240, 247, 0.75);
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.3rem 0.7rem;
}

/* ---- Negocios recientes ---- */
.recent-scroll { display: flex; flex-direction: column; gap: 12px; }
@media (min-width: 780px) {
  .recent-scroll { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1180px) {
  .recent-scroll { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
.recent-empty { color: var(--color-text-muted); font-size: 0.9rem; line-height: 1.5; margin: 0; }

/* ---- Lista de citas ---- */
.stack { display: grid; gap: 12px; }

/* ---- Estados ---- */
.state {
  background: rgba(16, 37, 44, 0.72);
  border: 1px solid rgba(63, 225, 255, 0.12);
  border-radius: 10px;
  color: rgba(213, 240, 247, 0.68);
  padding: 18px;
}
.state--compact { padding: 14px; }
.state-error { border-color: rgba(255, 107, 107, 0.3); color: #ff8585; }

@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .work-page { padding: 20px 14px; }
  .work-header { align-items: flex-start; flex-direction: column; }
}
</style>