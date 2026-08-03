<!-- ============================================================
     ServiceFormModal.vue — Crear / editar un servicio
     ============================================================
     Modal controlado por Vue (Teleport a body), con clases de
     Bootstrap para el aspecto. Evita depender del JS de Bootstrap
     (bundle UMD no expone window.bootstrap en Vite).
     ============================================================ -->

<template>
  <Teleport to="body">
    <div v-if="visible" class="services-modal-root" role="presentation">
      <div class="modal-backdrop fade show"></div>

      <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true" :aria-label="isEdit ? 'Editar servicio' : 'Nuevo servicio'">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content services-modal">
            <div class="modal-header">
              <h2 class="modal-title">{{ isEdit ? 'Editar servicio' : 'Nuevo servicio' }}</h2>
              <button type="button" class="btn-close" aria-label="Cerrar" @click="close"></button>
            </div>

            <form class="services-form" novalidate @submit.prevent="handleSubmit">
              <div class="modal-body">
                <div class="mb-3">
                  <label for="svc-name" class="form-label">
                    Nombre <span class="required-mark" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="svc-name"
                    ref="nameInput"
                    v-model.trim="form.name"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.name }"
                    placeholder="Ej. Corte de cabello"
                    maxlength="120"
                  />
                  <div class="invalid-feedback">{{ errors.name }}</div>
                </div>

                <div class="mb-3">
                  <label for="svc-desc" class="form-label">Descripción</label>
                  <textarea
                    id="svc-desc"
                    v-model.trim="form.description"
                    class="form-control"
                    rows="3"
                    placeholder="Describe el servicio (opcional)"
                    maxlength="500"
                  ></textarea>
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-sm-6">
                    <label for="svc-price" class="form-label">
                      Precio <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text services-input-group-text">$</span>
                      <input
                        id="svc-price"
                        v-model.number="form.price"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': errors.price }"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div class="invalid-feedback">{{ errors.price }}</div>
                  </div>

                  <div class="col-sm-6">
                    <label for="svc-duration" class="form-label">
                      Duración <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <div class="input-group">
                      <input
                        id="svc-duration"
                        v-model.number="form.durationMinutes"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': errors.durationMinutes }"
                        min="1"
                        step="5"
                        placeholder="45"
                      />
                      <span class="input-group-text services-input-group-text">min</span>
                    </div>
                    <div class="invalid-feedback">{{ errors.durationMinutes }}</div>
                  </div>
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-sm-6">
                    <label for="svc-buffer" class="form-label">Buffer entre citas</label>
                    <div class="input-group">
                      <input
                        id="svc-buffer"
                        v-model.number="form.bufferMinutes"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': errors.bufferMinutes }"
                        min="0"
                        step="5"
                        placeholder="0"
                      />
                      <span class="input-group-text services-input-group-text">min</span>
                    </div>
                    <div class="invalid-feedback">{{ errors.bufferMinutes }}</div>
                    <div class="field-hint">Tiempo de descanso entre citas (opcional)</div>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-ghost" @click="close">Cancelar</button>
                <button type="submit" class="btn services-btn-primary" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ isEdit ? 'Guardar cambios' : 'Crear servicio' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * ServiceFormModal.vue
 * Abre con open(service|null): null crea, un objeto edita.
 * Los campos marcados con * son obligatorios.
 */
import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useServicesStore } from '@/stores/services'

const store = useServicesStore()

const visible = ref(false)
const nameInput = ref(null)

const emptyForm = () => ({
  name: '',
  description: '',
  price: null,
  durationMinutes: 30,
  bufferMinutes: 0,
})

const form = reactive(emptyForm())
const errors = reactive({ name: '', price: '', durationMinutes: '', bufferMinutes: '' })
const saving = ref(false)

const isEdit = computed(() => form.id != null)

/** open — Abre el modal en modo crear (null) o editar (servicio) */
const open = (service) => {
  const source = service || emptyForm()
  Object.assign(form, emptyForm(), source)
  Object.keys(errors).forEach((key) => { errors[key] = '' })
  visible.value = true
  document.body.classList.add('modal-open')
  nextTick(() => nameInput.value?.focus())
}

/** close — Cierra el modal */
const close = () => {
  visible.value = false
  document.body.classList.remove('modal-open')
}

/** onKeydown — ESC cierra el modal */
const onKeydown = (event) => {
  if (event.key === 'Escape' && visible.value && !saving.value) close()
}

/** validate — Reglas espejo de ServiceRequest */
const validate = () => {
  let ok = true
  Object.keys(errors).forEach((key) => { errors[key] = '' })

  if (!form.name) {
    errors.name = 'El nombre es obligatorio'
    ok = false
  }

  if (!form.price || form.price <= 0) {
    errors.price = 'El precio debe ser mayor a 0'
    ok = false
  }

  if (!form.durationMinutes || form.durationMinutes <= 0) {
    errors.durationMinutes = 'La duración debe ser mayor a 0'
    ok = false
  }

  if (form.bufferMinutes < 0) {
    errors.bufferMinutes = 'El buffer no puede ser negativo'
    ok = false
  }

  return ok
}

/** handleSubmit — Crea o actualiza según el modo */
const handleSubmit = async () => {
  if (!validate() || saving.value) return

  saving.value = true
  try {
    const payload = {
      name: form.name,
      description: form.description || null,
      durationMinutes: form.durationMinutes,
      bufferMinutes: form.bufferMinutes || 0,
      price: form.price,
    }
    if (isEdit.value) {
      await store.update(form.id, payload)
    } else {
      await store.create(payload)
    }
    close()
  } catch {
    // El error queda visible en la vista (store.error)
  } finally {
    saving.value = false
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
