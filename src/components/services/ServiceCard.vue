<!-- ============================================================
     ServiceCard.vue — Tarjeta de servicio (grid de Servicios)
     ============================================================
     Muestra avatar con iniciales, nombre, descripción, duración y
     precio. Menú ⋮ con Editar/Eliminar (soft delete).
     ============================================================ -->

<template>
  <div class="service-card">
    <div class="service-card-head">
      <span class="service-avatar">{{ initials }}</span>

      <div class="service-title-wrap">
        <h3 class="service-name" :title="service.name">{{ service.name }}</h3>
        <span class="status-badge status-active">Activo</span>
      </div>

      <div class="service-head-actions">
        <div class="dropdown">
          <button
            type="button"
            class="service-menu-btn"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            aria-label="Acciones del servicio"
          >
            <span v-html="moreIcon"></span>
          </button>
          <ul class="dropdown-menu service-dropdown-menu dropdown-menu-end">
            <li>
              <button type="button" class="dropdown-item" @click="$emit('edit', service)">
                <span class="dropdown-item-icon" v-html="pencilIcon"></span>
                Editar
              </button>
            </li>
            <li><hr class="dropdown-divider" /></li>
            <li>
              <button
                type="button"
                class="dropdown-item text-danger"
                @click="$emit('delete', service)"
              >
                <span class="dropdown-item-icon" v-html="trashIcon"></span>
                Eliminar
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <p class="service-desc" :class="{ 'is-empty': !service.description }">
      {{ service.description || 'Sin descripción' }}
    </p>

    <div class="service-card-foot">
      <span class="service-duration">
        <span class="service-duration-icon" v-html="clockIcon"></span>
        {{ formatDuration(service.durationMinutes) }}
        <template v-if="service.bufferMinutes > 0"> · {{ service.bufferMinutes }} min</template>
      </span>
      <span class="service-price">{{ formatPrice(service.price) }}</span>
    </div>
  </div>
</template>

<script setup>
/**
 * ServiceCard.vue
 * Emite 'edit' y 'delete' hacia la vista padre.
 */
import { computed } from 'vue'

import moreIcon from '@/assets/images/icons/more-vertical.svg?raw'
import pencilIcon from '@/assets/images/icons/pencil.svg?raw'
import clockIcon from '@/assets/images/icons/clock.svg?raw'
import trashIcon from '@/assets/images/icons/trash.svg?raw'

const props = defineProps({
  service: { type: Object, required: true },
})

const emit = defineEmits(['edit', 'delete'])

/** initials — Iniciales del nombre del servicio (máx. 2 letras) */
const initials = computed(() => {
  const words = props.service.name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]?.[0] || ''
  const second = words.length > 1 ? words[words.length - 1][0] : ''
  return (first + second).toUpperCase() || 'S'
})

/** formatDuration — "45 min", "1 h", "1 h 30 min" */
const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

/** formatPrice — Moneda local sin decimales */
const formatPrice = (price) => {
  if (price === null || price === undefined) return 'A convenir'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price)
}
</script>
