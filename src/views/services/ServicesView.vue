<!-- ============================================================
     ServicesView.vue — CRUD de servicios del negocio (solo dueño)
     ============================================================
     Grid de tarjetas + buscador + modales de crear/editar y eliminar.
     Alineación de centro a derecha (patrón Settings).
     ============================================================ -->

<template>
  <div class="services-page">
    <header class="services-header">
      <h1 class="services-title">Servicios</h1>
      <button class="btn-back" @click="router.push('/dashboard')">
        <span class="btn-back-icon" v-html="chevronLeftIcon"></span>
        Volver
      </button>
    </header>

    <div class="services-content">
      <div class="services-toolbar">
        <div class="input-group services-search">
          <span class="input-group-text services-search-icon" v-html="searchIcon"></span>
          <input
            v-model.trim="search"
            type="text"
            class="form-control"
            placeholder="Buscar servicio..."
            aria-label="Buscar servicio"
          />
        </div>

        <button type="button" class="btn btn-primary services-btn-primary" @click="openCreate">
          <span class="btn-plus-icon">+</span>
          Nuevo servicio
        </button>
      </div>

      <div v-if="store.loading" class="services-loading">
        <span class="spinner-border spinner-border-sm" role="status"></span>
        Cargando servicios...
      </div>

      <div v-else-if="store.error && services.length === 0" class="services-alert services-alert-error">
        <span v-html="alertIcon"></span>
        <span>{{ store.error }}</span>
      </div>

      <div v-else-if="services.length === 0" class="services-empty">
        <h2 class="services-empty-title">Aún no tienes servicios</h2>
        <p class="services-empty-text">Crea tu primer servicio para empezar a tomar reservas.</p>
        <button type="button" class="btn btn-primary services-btn-primary" @click="openCreate">
          Crear mi primer servicio
        </button>
      </div>

      <template v-else>
        <div v-if="store.error" class="services-alert services-alert-error">
          <span v-html="alertIcon"></span>
          <span>{{ store.error }}</span>
        </div>

          <div class="services-grid">
            <ServiceCard
              v-for="service in services"
              :key="service.id"
              :service="service"
              @edit="openEdit"
              @delete="openDelete"
            />
          </div>

        <p v-if="services.length === 0 && search" class="services-no-results">
          No hay servicios que coincidan con tu búsqueda.
        </p>
      </template>
    </div>

    <ServiceFormModal ref="formModalRef" />
    <ServiceDeleteModal ref="deleteModalRef" />
  </div>
</template>

<script setup>
/**
 * ServicesView.vue
 * Página de servicios: carga al montar y filtra por texto.
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useServicesStore } from '@/stores/services'
import ServiceCard from '@/components/services/ServiceCard.vue'
import ServiceFormModal from '@/components/services/ServiceFormModal.vue'
import ServiceDeleteModal from '@/components/services/ServiceDeleteModal.vue'

import chevronLeftIcon from '@/assets/images/icons/chevron-left.svg?raw'
import searchIcon from '@/assets/images/icons/search.svg?raw'
import alertIcon from '@/assets/images/icons/alert-circle.svg?raw'

const router = useRouter()
const store = useServicesStore()

const formModalRef = ref(null)
const deleteModalRef = ref(null)

const search = ref('')

/** services — Lista filtrada por búsqueda */
const services = computed(() => {
  const term = search.value.toLowerCase()
  if (!term) return store.services
  return store.services.filter(
    (s) =>
      s.name.toLowerCase().includes(term) ||
      (s.description || '').toLowerCase().includes(term)
  )
})

const openCreate = () => {
  formModalRef.value?.open(null)
}

const openEdit = (service) => {
  formModalRef.value?.open(service)
}

const openDelete = (service) => {
  deleteModalRef.value?.open(service)
}

onMounted(() => {
  if (!store.fetched) store.fetchAll()
})
</script>
