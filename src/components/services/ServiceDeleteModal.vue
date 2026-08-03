<!-- ============================================================
     ServiceDeleteModal.vue — Confirmación de eliminación (soft delete)
     ============================================================
     Modal controlado por Vue (Teleport a body), clases de Bootstrap
     para el aspecto. Pide confirmación antes de borrar lógicamente.
     ============================================================ -->

<template>
  <Teleport to="body">
    <div v-if="visible" class="services-modal-root" role="presentation">
      <div class="modal-backdrop fade show"></div>

      <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true" aria-label="Eliminar servicio">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content services-modal">
            <div class="modal-header">
              <h2 class="modal-title">Eliminar servicio</h2>
              <button type="button" class="btn-close" aria-label="Cerrar" @click="close"></button>
            </div>

            <div class="modal-body">
              <p class="delete-text">
                ¿Estás seguro de que quieres eliminar
                <strong class="delete-name">"{{ service?.name || 'este servicio' }}"</strong>?
              </p>
              <p class="delete-hint">El servicio dejará de estar disponible para nuevas reservas.</p>

              <div v-if="error" class="services-alert services-alert-error">
                <span v-html="alertIcon"></span>
                <span>{{ error }}</span>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" @click="close">Cancelar</button>
              <button
                type="button"
                class="services-btn-danger"
                :disabled="deleting"
                @click="handleDelete"
              >
                <span v-if="deleting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * ServiceDeleteModal.vue
 * Abre con open(service). Elimina (soft delete) tras confirmar.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useServicesStore } from '@/stores/services'

import alertIcon from '@/assets/images/icons/alert-circle.svg?raw'

const store = useServicesStore()

const visible = ref(false)
const service = ref(null)
const deleting = ref(false)
const error = ref('')

/** open — Abre el modal apuntando al servicio a eliminar */
const open = (svc) => {
  service.value = svc
  error.value = ''
  visible.value = true
  document.body.classList.add('modal-open')
}

/** close — Cierra el modal */
const close = () => {
  visible.value = false
  document.body.classList.remove('modal-open')
}

/** onKeydown — ESC cierra el modal */
const onKeydown = (event) => {
  if (event.key === 'Escape' && visible.value && !deleting.value) close()
}

/** handleDelete — Elimina (soft delete) y cierra el modal */
const handleDelete = async () => {
  if (!service.value || deleting.value) return

  deleting.value = true
  error.value = ''
  try {
    await store.remove(service.value.id)
    close()
  } catch (e) {
    error.value = e.message || 'Error al eliminar el servicio'
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.classList.remove('modal-open')
})

defineExpose({ open })
</script>
