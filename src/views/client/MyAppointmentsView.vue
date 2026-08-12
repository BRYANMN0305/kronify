<template>
  <div class="work-page">
    <header class="work-header">
      <h1>Negocios Recientes</h1>
      <button class="btn btn-outline-light" @click="load">Actualizar</button>
    </header>

    <section v-if="isClient" class="recent-section">
      <div class="recent-head">
        <div>
          <span class="recent-kicker">Agenda rapida</span>
          <h2>Negocios recientes</h2>
        </div>
        <span v-if="recentBusinesses.length" class="recent-count">{{ recentBusinesses.length }}</span>
      </div>

      <div v-if="loadingRecent" class="state state--compact">Cargando negocios recientes...</div>
      <div v-else-if="recentError" class="state state--compact state-error">{{ recentError }}</div>
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

    <div v-if="loading" class="state">Cargando Negocios ...</div>
    <div v-else-if="error" class="state state-error">{{ error }}</div>
    <div v-else-if="appointments.length === 0" class="state">Aun no tienes negocios registrados.</div>

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
    recentError.value = err.message || 'No se pudieron cargar los negocios recientes'
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
.work-page { background: var(--color-bg); color: var(--color-text); min-height: 100vh; padding: 28px; }
.work-header { align-items: center; display: flex; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.work-header h1 { font-size: 1.5rem; margin: 0; }
.stack { display: flex; flex-direction: column; gap: 10px; }
.state { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text-muted); padding: 18px; }
.state-error { color: var(--color-error); }

.recent-section { margin-bottom: 26px; }
.recent-head { align-items: center; display: flex; gap: 12px; justify-content: space-between; margin-bottom: 14px; }
.recent-kicker { color: var(--neon); display: block; font-size: 0.72rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
.recent-head h2 { color: var(--color-text); font-size: 1.15rem; font-weight: 900; margin: 3px 0 0; }
.recent-count {
  background: rgba(63, 225, 255, 0.12);
  border: 1px solid rgba(63, 225, 255, 0.2);
  border-radius: 999px;
  color: rgba(213, 240, 247, 0.75);
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.3rem 0.7rem;
}
.recent-scroll {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
@media (min-width: 780px) {
  .recent-scroll { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1180px) {
  .recent-scroll { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
.state--compact { padding: 14px; }
.recent-empty { color: var(--color-text-muted); font-size: 0.9rem; line-height: 1.5; margin: 0; }
</style>