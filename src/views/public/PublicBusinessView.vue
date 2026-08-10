<template>
  <div v-if="business" class="public-business">
    <BusinessHeader :business="business" @book="openBooking(null)" />

    <div class="pb-content">
      <main class="pb-main">
        <div class="pb-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="pb-tab"
            :class="{ 'pb-tab--active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <section v-if="activeTab === 'servicios'" class="pb-section">
          <div class="pb-section-head">
            <div>
              <span class="pb-kicker">Catalogo</span>
              <h2>Servicios disponibles</h2>
            </div>
            <span class="pb-count">{{ business.services?.length || 0 }} servicios</span>
          </div>

          <div class="pb-services-grid">
            <ServiceCard
              v-for="service in business.services"
              :key="service.serviceId"
              :service="service"
              @book="openBooking(service)"
            />
          </div>
        </section>

        <section v-else-if="activeTab === 'equipo'" class="pb-section">
          <div class="pb-section-head">
            <div>
              <span class="pb-kicker">Equipo</span>
              <h2>Profesionales</h2>
            </div>
            <span class="pb-count">{{ business.employees?.length || 0 }} miembros</span>
          </div>

          <div v-if="business.employees?.length" class="pb-team-grid">
            <article v-for="emp in business.employees" :key="emp.employeeId" class="pb-employee-card">
              <span class="pb-employee-avatar">{{ initials(emp.name) }}</span>
              <div>
                <strong>{{ emp.name }}</strong>
                <p>{{ employeeServices(emp).join(', ') || 'Servicios del negocio' }}</p>
              </div>
            </article>
          </div>
          <p v-else class="pb-empty">Aun no hay empleados registrados.</p>
        </section>

        <section v-else class="pb-section">
          <div class="pb-section-head">
            <div>
              <span class="pb-kicker">Experiencias</span>
              <h2>Reseñas de clientes</h2>
            </div>
            <span class="pb-count">{{ reviews.length }} reseñas</span>
          </div>
          <ReviewList :reviews="reviews" />
        </section>
      </main>

      <aside class="pb-aside">
        <div class="pb-aside-card">
          <span class="pb-aside-label">Resumen</span>
          <div class="pb-aside-stat">
            <strong>{{ business.services?.length || 0 }}</strong>
            <span>Servicios</span>
          </div>
          <div class="pb-aside-stat">
            <strong>{{ business.employees?.length || 0 }}</strong>
            <span>Profesionales</span>
          </div>
          <button class="pb-aside-button" @click="openBooking(null)">Reservar cita</button>
        </div>
      </aside>
    </div>

    <BookingModal
      v-model="bookingOpen"
      :business="business"
      :initial-service="bookingService"
    />
  </div>
  <div v-else-if="loading" class="state-message">Cargando...</div>
  <div v-else class="state-message">Negocio no encontrado.</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { publicBusinessService } from '@/api/publicBusiness'
import BusinessHeader from '@/components/public/BusinessHeader.vue'
import ServiceCard from '@/components/public/ServiceCard.vue'
import ReviewList from '@/components/public/ReviewList.vue'
import BookingModal from '@/components/booking/BookingModal.vue'

const route = useRoute()
const business = ref(null)
const loading = ref(true)
const activeTab = ref('servicios')
const bookingOpen = ref(false)
const bookingService = ref(null)
const reviews = ref([])

const tabs = [
  { key: 'servicios', label: 'Servicios' },
  { key: 'equipo', label: 'Equipo' },
  { key: 'resenas', label: 'Reseñas' },
]

function openBooking(service) {
  bookingService.value = service
  bookingOpen.value = true
}

function initials(name) {
  return String(name || 'P')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function employeeServices(employee) {
  const ids = employee.serviceIds || []
  return (business.value?.services || [])
    .filter((service) => ids.includes(service.serviceId))
    .map((service) => service.name)
}

onMounted(async () => {
  try {
    business.value = await publicBusinessService.getBySlug(route.params.slug)
    reviews.value = await publicBusinessService.listReviews(route.params.slug).catch(() => [])
  } catch (err) {
    business.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style>
.public-business {
  background: radial-gradient(circle at top right, rgba(63, 225, 255, 0.05), transparent 32%), var(--color-bg);
  min-height: 100vh;
}
.pb-content {
  align-items: start;
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1fr) 280px;
  margin: 0 auto;
  max-width: 1180px;
  padding: 28px;
}
.pb-main { min-width: 0; }
.pb-tabs {
  background: rgba(16, 37, 44, 0.66);
  border: 1px solid rgba(213, 240, 247, 0.08);
  border-radius: 12px;
  display: inline-flex;
  gap: 4px;
  margin-bottom: 18px;
  padding: 5px;
}
.pb-tab {
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(213, 240, 247, 0.58);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 9px 16px;
}
.pb-tab--active { background: rgba(63, 225, 255, 0.14); color: var(--color-text); }
.pb-section {
  background: rgba(6, 13, 16, 0.26);
  border: 1px solid rgba(213, 240, 247, 0.08);
  border-radius: 14px;
  padding: 18px;
}
.pb-section-head {
  align-items: center;
  display: flex;
  gap: 14px;
  justify-content: space-between;
  margin-bottom: 16px;
}
.pb-kicker { color: var(--neon); font-size: 0.72rem; font-weight: 900; text-transform: uppercase; }
.pb-section-head h2 { color: var(--color-text); font-size: 1.18rem; font-weight: 900; margin: 2px 0 0; }
.pb-count {
  background: rgba(213, 240, 247, 0.08);
  border: 1px solid rgba(213, 240, 247, 0.1);
  border-radius: 999px;
  color: rgba(213, 240, 247, 0.72);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.35rem 0.7rem;
}
.pb-services-grid { display: grid; gap: 12px; }
.pb-team-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
.pb-employee-card {
  align-items: center;
  background: rgba(16, 37, 44, 0.84);
  border: 1px solid rgba(213, 240, 247, 0.1);
  border-radius: 12px;
  display: flex;
  gap: 12px;
  padding: 14px;
}
.pb-employee-avatar {
  align-items: center;
  background: rgba(63, 225, 255, 0.14);
  border-radius: 12px;
  color: var(--neon);
  display: inline-flex;
  flex-shrink: 0;
  font-weight: 900;
  height: 42px;
  justify-content: center;
  width: 42px;
}
.pb-employee-card strong { color: var(--color-text); }
.pb-employee-card p { color: rgba(213, 240, 247, 0.56); font-size: 0.82rem; margin: 3px 0 0; }
.pb-aside { position: sticky; top: 20px; }
.pb-aside-card {
  background: linear-gradient(180deg, rgba(16, 37, 44, 0.95), rgba(10, 24, 30, 0.95));
  border: 1px solid rgba(63, 225, 255, 0.16);
  border-radius: 14px;
  padding: 18px;
}
.pb-aside-label { color: var(--neon); font-size: 0.72rem; font-weight: 900; text-transform: uppercase; }
.pb-aside-stat {
  align-items: baseline;
  border-bottom: 1px solid rgba(213, 240, 247, 0.08);
  display: flex;
  justify-content: space-between;
  padding: 13px 0;
}
.pb-aside-stat strong { color: var(--color-text); font-size: 1.5rem; }
.pb-aside-stat span { color: rgba(213, 240, 247, 0.62); }
.pb-aside-button {
  background: var(--neon);
  border: 0;
  border-radius: 10px;
  color: var(--color-bg);
  font-weight: 900;
  margin-top: 16px;
  padding: 12px;
  width: 100%;
}
.pb-empty { color: var(--color-text-muted); font-size: 0.9rem; margin: 0; }
.state-message { min-height: 60vh; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); background: var(--color-bg); }

@media (max-width: 900px) {
  .pb-content { grid-template-columns: 1fr; }
  .pb-aside { position: static; }
}
@media (max-width: 560px) {
  .pb-content { padding: 18px; }
  .pb-tabs { display: grid; grid-template-columns: repeat(3, 1fr); width: 100%; }
  .pb-tab { padding: 9px 8px; }
  .pb-section-head { align-items: flex-start; flex-direction: column; }
}
</style>
