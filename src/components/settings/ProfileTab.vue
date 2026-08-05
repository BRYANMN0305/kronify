<!-- ============================================================
     ProfileTab.vue — Perfil del negocio (solo dueño)
     ============================================================
     Secciones en solo lectura estilo ProDeel con botón "Editar":
       1. Perfil del negocio — logo + nombre + categoría
       2. Información de contacto — email, teléfono, whatsapp, dirección
       3. Descripción
     + Toggle "trabajar como empleado" (POST owner/toggle)
     ============================================================ -->

<template>
  <div class="settings-tab">
  <!-- Toggle: trabajar como empleado -->
  <div class="owner-toggle">
    <div>
      <div class="owner-toggle-label">¿Trabajas como empleado en tu negocio?</div>
      <div class="owner-toggle-hint">Aparecerás como parte de tu equipo de trabajo</div>
    </div>
    <label class="switch">
      <input
        type="checkbox"
        :checked="ownerWorksAsEmployee"
        :disabled="toggling"
        @change="handleOwnerToggle"
      />
      <span class="switch-slider"></span>
    </label>
  </div>

  <div v-if="toggleError" class="settings-alert settings-alert-error">
    <span v-html="alertIcon"></span>
    <span>{{ toggleError }}</span>
  </div>

  <!-- Sección: Perfil del negocio -->
  <section class="settings-section">
    <div class="settings-section-header">
      <div>
        <h3 class="settings-section-title">Perfil del negocio</h3>
        <p class="settings-section-subtitle">Nombre, categoría y logo</p>
      </div>
      <button v-if="!editing" type="button" class="btn-edit" @click="startEdit">
        <span v-html="pencilIcon"></span>
        Editar
      </button>
      <button v-else type="button" class="btn-ghost" @click="cancelEdit">Cancelar</button>
    </div>

    <div v-if="!editing" class="settings-profile-header">
      <span class="settings-profile-avatar">
        <img v-if="settingsStore.businessData?.logoUrl" :src="settingsStore.businessData.logoUrl" alt="Logo del negocio" />
        <template v-else>{{ businessInitial }}</template>
      </span>
      <div>
        <p class="settings-profile-name">{{ settingsStore.businessData?.name || '—' }}</p>
        <p class="settings-profile-meta">{{ settingsStore.businessData?.category || 'Sin categoría' }}</p>
      </div>
    </div>
  </section>

  <!-- Sección: Información de contacto -->
  <section class="settings-section">
    <div class="settings-section-header">
      <div>
        <h3 class="settings-section-title">Información de contacto</h3>
        <p class="settings-section-subtitle">Formas en que tus clientes pueden contactarte</p>
      </div>
    </div>

    <div v-if="!editing" class="settings-data-grid">
      <div>
        <div class="settings-data-label">Correo electrónico</div>
        <div class="settings-data-value">{{ settingsStore.businessData?.email || '—' }}</div>
      </div>
      <div>
        <div class="settings-data-label">Teléfono</div>
        <div class="settings-data-value">{{ settingsStore.businessData?.phoneNumber || '—' }}</div>
      </div>
      <div>
        <div class="settings-data-label">WhatsApp</div>
        <div class="settings-data-value">{{ settingsStore.businessData?.whatsApp || '—' }}</div>
      </div>
      <div>
        <div class="settings-data-label">Dirección</div>
        <div class="settings-data-value">{{ settingsStore.businessData?.address || '—' }}</div>
      </div>
      <div>
        <div class="settings-data-label">Fecha de creación</div>
        <div class="settings-data-value">{{ formatDate(settingsStore.businessData?.createdAt) }}</div>
      </div>
      <div>
        <div class="settings-data-label">Última actualización</div>
        <div class="settings-data-value">{{ formatDate(settingsStore.businessData?.updatedAt) }}</div>
      </div>
    </div>
  </section>

  <!-- Sección: Descripción -->
  <section class="settings-section">
    <div class="settings-section-header">
      <div>
        <h3 class="settings-section-title">Descripción</h3>
        <p class="settings-section-subtitle">Describe brevemente tu negocio</p>
      </div>
    </div>

    <div v-if="!editing" class="settings-data-value">
      {{ settingsStore.businessData?.description || 'Sin descripción' }}
    </div>
  </section>

  <!-- Modo edición: formulario completo -->
  <form v-if="editing" class="settings-section settings-form" novalidate @submit.prevent="handleSubmit">
    <div class="settings-section-header">
      <div>
        <h3 class="settings-section-title">Editar negocio</h3>
        <p class="settings-section-subtitle">Modifica los datos de tu negocio</p>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label" for="pbName">Nombre del negocio</label>
        <input
          id="pbName"
          v-model="form.name"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.name }"
          placeholder="Ej: Barbería El Clásico"
        />
        <div class="invalid-feedback">{{ errors.name }}</div>
      </div>

      <div class="col-md-6">
        <CategoryDropdown v-model="form.category" :invalid="!!errors.category" />
        <div class="invalid-feedback">{{ errors.category }}</div>
      </div>

      <div class="col-md-6">
        <label class="form-label" for="pbEmail">Email de contacto</label>
        <input
          id="pbEmail"
          v-model="form.email"
          type="email"
          class="form-control"
          :class="{ 'is-invalid': errors.email }"
          placeholder="contacto@negocio.com"
        />
        <div class="invalid-feedback">{{ errors.email }}</div>
      </div>

      <div class="col-md-6">
        <label class="form-label" for="pbWhatsApp">WhatsApp</label>
        <input
          id="pbWhatsApp"
          v-model="form.whatsApp"
          type="tel"
          class="form-control"
          :class="{ 'is-invalid': errors.whatsApp }"
          placeholder="+57 3006217237"
        />
        <div class="invalid-feedback">{{ errors.whatsApp }}</div>
      </div>

      <div class="col-md-6">
        <label class="form-label" for="pbPhone">Teléfono</label>
        <input
          id="pbPhone"
          v-model="form.phoneNumber"
          type="tel"
          class="form-control"
          :class="{ 'is-invalid': errors.phoneNumber }"
          placeholder="+57 3006217237"
        />
        <div class="invalid-feedback">{{ errors.phoneNumber }}</div>
      </div>

      <div class="col-md-6">
        <label class="form-label" for="pbAddress">Dirección</label>
        <input
          id="pbAddress"
          v-model="form.address"
          type="text"
          class="form-control"
          placeholder="Calle 123 #45-67"
        />
      </div>

      <div class="col-md-6">
        <LogoUpload v-model="form.logoUrl" />
      </div>

      <div class="col-12">
        <label class="form-label" for="pbDescription">Descripción</label>
        <textarea
          id="pbDescription"
          v-model="form.description"
          class="form-control"
          rows="3"
          placeholder="Describe brevemente tu negocio..."
        ></textarea>
      </div>
    </div>

    <div class="d-flex gap-2 mt-4 settings-form-actions">
      <button type="submit" class="btn btn-primary" :disabled="saving">
        <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
        {{ saving ? 'Guardando...' : 'Guardar cambios' }}
      </button>
      <button type="button" class="btn-ghost" @click="cancelEdit">Cancelar</button>
    </div>

    <div v-if="error" class="settings-alert settings-alert-error">
      <span v-html="alertIcon"></span>
      <span>{{ error }}</span>
    </div>
  </form>
  </div>
</template>

<script setup>
/**
 * ProfileTab.vue
 * Solo se renderiza cuando el usuario es dueño del negocio (isOwner).
 */
import { reactive, ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { useSettingsStore } from '@/stores/settings'
import { businessService } from '@/api/business'
import CategoryDropdown from '@/components/onboarding/CategoryDropdown.vue'
import LogoUpload from '@/components/onboarding/LogoUpload.vue'

import alertIcon from '@/assets/images/icons/alert-circle.svg?raw'
import pencilIcon from '@/assets/images/icons/pencil.svg?raw'

const settingsStore = useSettingsStore()

const form = reactive({
  name: '',
  category: '',
  description: '',
  address: '',
  logoUrl: null,
  email: '',
  phoneNumber: '',
  whatsApp: '',
})

const errors = reactive({ name: '', category: '', email: '', phoneNumber: '', whatsApp: '' })
const editing = ref(false)
const saving = ref(false)
const error = ref('')

const ownerWorksAsEmployee = computed(() => settingsStore.ownerAsEmployee)
const toggling = ref(false)
const toggleError = ref('')

const businessInitial = computed(() => {
  const name = settingsStore.businessData?.name || ''
  return name.trim()?.[0]?.toUpperCase() || 'N'
})

const formatDate = (value) => (value ? dayjs(value).format('DD MMM YYYY') : '—')

const fillForm = () => {
  const b = settingsStore.businessData
  if (!b) return
  form.name = b.name || ''
  form.category = b.category || ''
  form.description = b.description || ''
  form.address = b.address || ''
  form.logoUrl = b.logoUrl || null
  form.email = b.email || ''
  form.phoneNumber = b.phoneNumber || ''
  form.whatsApp = b.whatsApp || ''
}

watch(
  () => settingsStore.businessData,
  (b) => {
    if (!editing.value) fillForm()
  },
  { immediate: true }
)

const startEdit = () => {
  fillForm()
  error.value = ''
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
  error.value = ''
  Object.keys(errors).forEach((k) => (errors[k] = ''))
}

const optionalText = (value) => {
  const trimmed = String(value || '').trim()
  return trimmed ? trimmed : null
}

const validate = () => {
  let ok = true
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  if (!form.name.trim()) {
    errors.name = 'El nombre del negocio es obligatorio'
    ok = false
  }
  if (!form.email.trim()) {
    errors.email = 'El email es obligatorio'
    ok = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Ingresa un email válido'
    ok = false
  }
  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = 'El teléfono es obligatorio'
    ok = false
  }
  if (!form.whatsApp.trim()) {
    errors.whatsApp = 'El WhatsApp es obligatorio'
    ok = false
  }
  return ok
}

const handleOwnerToggle = async (e) => {
  const enabled = e.target.checked
  toggling.value = true
  toggleError.value = ''
  try {
    await settingsStore.toggleOwnerAsEmployee(enabled)
  } catch (err) {
    e.target.checked = !enabled
    toggleError.value = err.message || 'Error al actualizar la opción'
  } finally {
    toggling.value = false
  }
}

const handleSubmit = async () => {
  if (!validate()) return
  saving.value = true
  error.value = ''
  try {
    let logoUrl = form.logoUrl
    if (form.logoUrl instanceof File) {
      const res = await businessService.uploadImage(form.logoUrl)
      logoUrl = res.url
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      description: optionalText(form.description),
      address: optionalText(form.address),
      logoUrl,
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      whatsApp: form.whatsApp.trim(),
      ownerWorksAsEmployee: ownerWorksAsEmployee.value,
    }

    const updated = await businessService.update(payload)
    settingsStore.businessData = { ...settingsStore.businessData, ...updated }
    form.logoUrl = updated.logoUrl ?? logoUrl
    editing.value = false
  } catch (e) {
    error.value = e.message || 'Error al actualizar el negocio'
  } finally {
    saving.value = false
  }
}
</script>
