<template>
  <div v-if="business" class="public-business">
    <BusinessHeader :business="business" @book="openBooking(null)" />

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ 'tab--active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="container py-4">
      <div v-if="activeTab === 'servicios'" class="d-flex flex-column gap-2">
        <ServiceCard
          v-for="service in business.services"
          :key="service.serviceId"
          :service="service"
          @book="openBooking(service)"
        />
      </div>

      <div v-else-if="activeTab === 'equipo'" class="d-flex flex-wrap gap-2">
        <span v-for="emp in business.employees" :key="emp.employeeId" class="employee-chip">{{ emp.name }}</span>
        <p v-if="!business.employees?.length" class="empty-message">Aún no hay empleados registrados.</p>
      </div>

      <div v-else class="empty-message">Las reseñas estarán disponibles próximamente.</div>
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
import BookingModal from '@/components/booking/BookingModal.vue'

const route = useRoute()
const business = ref(null)
const loading = ref(true)
const activeTab = ref('servicios')
const bookingOpen = ref(false)
const bookingService = ref(null)

const tabs = [
  { key: 'servicios', label: 'Servicios' },
  { key: 'equipo', label: 'Equipo' },
  { key: 'reseñas', label: 'Reseñas' },
]

function openBooking(service) {
  bookingService.value = service
  bookingOpen.value = true
}

onMounted(async () => {
  try {
    business.value = await publicBusinessService.getBySlug(route.params.slug)
  } catch (err) {
    business.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.tabs { display: flex; gap: 24px; padding: 0 24px; border-bottom: 1px solid var(--color-border); }
.tab { background: none; border: none; padding: 10px 0; color: var(--color-text-muted); font-size: 0.9rem; cursor: pointer; border-bottom: 2px solid transparent; }
.tab--active { color: var(--color-text); border-bottom-color: var(--neon); font-weight: 500; }
.employee-chip { background: var(--color-surface-alt); color: var(--color-text-label); border-radius: 999px; padding: 0.3rem 0.9rem; font-size: 0.85rem; }
.empty-message { color: var(--color-text-muted); font-size: 0.85rem; }
.state-message { min-height: 60vh; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); background: var(--color-bg); }
</style>